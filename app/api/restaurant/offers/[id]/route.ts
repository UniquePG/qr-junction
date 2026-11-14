import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { planErrorResponse } from "@/lib/billing/errors";
import { requireEnabled, requireWritable } from "@/lib/billing/guard";
import { invalidateRestaurant } from "@/lib/cache/invalidate";
import {
  isMenuOfferType,
  parsePresentation,
  parseRules,
  parseSchedule,
  parseTargets,
} from "@/lib/offers/rules";
import type { MenuOfferStatus } from "@/lib/offers/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function serializeOffer(offer: {
  id: number;
  restaurantId: number;
  menuId: number | null;
  type: string;
  status: string;
  title: string;
  subtitle: string | null;
  badgeLabel: string | null;
  imageUrl: string | null;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  schedule: Prisma.JsonValue | null;
  rules: Prisma.JsonValue;
  presentation: Prisma.JsonValue | null;
  i18n: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  targets: { kind: string; refId: number }[];
}) {
  return {
    id: offer.id,
    restaurantId: offer.restaurantId,
    menuId: offer.menuId,
    type: offer.type,
    status: offer.status,
    title: offer.title,
    subtitle: offer.subtitle,
    badgeLabel: offer.badgeLabel,
    imageUrl: offer.imageUrl,
    priority: offer.priority,
    startsAt: offer.startsAt?.toISOString() ?? null,
    endsAt: offer.endsAt?.toISOString() ?? null,
    schedule: offer.schedule,
    rules: offer.rules,
    presentation: offer.presentation,
    i18n: offer.i18n,
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
    targets: offer.targets.map((t) => ({ kind: t.kind, refId: t.refId })),
  };
}

async function loadOwnedOffer(userId: number, offerId: number) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!restaurant) return null;
  const offer = await prisma.menuOffer.findFirst({
    where: { id: offerId, restaurantId: restaurant.id },
    include: { targets: { select: { kind: true, refId: true } } },
  });
  if (!offer) return null;
  return { restaurant, offer };
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await ctx.params;
    const offerId = parseInt(id, 10);
    if (!Number.isFinite(offerId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const owned = await loadOwnedOffer(userId, offerId);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, offer: serializeOffer(owned.offer) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await requireWritable(userId);
    await requireEnabled(userId, "restaurant.offers");

    const { id } = await ctx.params;
    const offerId = parseInt(id, 10);
    if (!Number.isFinite(offerId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const owned = await loadOwnedOffer(userId, offerId);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const data: Prisma.MenuOfferUpdateInput = {};
    const b = body as Record<string, unknown>;

    if (b.type != null) {
      if (!isMenuOfferType(b.type)) {
        return NextResponse.json({ error: "Invalid offer type." }, { status: 400 });
      }
      data.type = b.type;
    }
    const nextType = (data.type as string | undefined) || owned.offer.type;

    if (b.title != null) {
      const title = String(b.title).trim().slice(0, 80);
      if (title.length < 2) return NextResponse.json({ error: "Add a short title." }, { status: 400 });
      data.title = title;
    }
    if (b.subtitle !== undefined) {
      data.subtitle = String(b.subtitle || "").trim().slice(0, 160) || null;
    }
    if (b.badgeLabel !== undefined) {
      data.badgeLabel = String(b.badgeLabel || "").trim().slice(0, 24) || null;
    }
    if (b.imageUrl !== undefined) {
      data.imageUrl = String(b.imageUrl || "").trim().slice(0, 500) || null;
    }
    if (b.priority != null) {
      data.priority = Math.max(0, Math.min(1000, Math.floor(Number(b.priority) || 0)));
    }
    if (b.status != null) {
      const statusRaw = String(b.status).toUpperCase();
      if (!["DRAFT", "ACTIVE", "PAUSED"].includes(statusRaw)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      data.status = statusRaw as MenuOfferStatus;
    }
    if (b.startsAt !== undefined) {
      if (!b.startsAt) data.startsAt = null;
      else {
        const d = new Date(String(b.startsAt));
        if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Invalid start date." }, { status: 400 });
        data.startsAt = d;
      }
    }
    if (b.endsAt !== undefined) {
      if (!b.endsAt) data.endsAt = null;
      else {
        const d = new Date(String(b.endsAt));
        if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Invalid end date." }, { status: 400 });
        data.endsAt = d;
      }
    }
    if (b.schedule !== undefined) {
      const schedule = parseSchedule(b.schedule);
      if (schedule && (schedule.windows?.length || schedule.daysOfWeek?.length)) {
        await requireEnabled(userId, "restaurant.offers.custom");
      }
      data.schedule = schedule ? (schedule as Prisma.InputJsonValue) : Prisma.JsonNull;
    }
    if (b.presentation !== undefined) {
      const presentation = parsePresentation(b.presentation);
      data.presentation = presentation
        ? (presentation as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    }
    if (b.rules != null) {
      if (!isMenuOfferType(nextType)) {
        return NextResponse.json({ error: "Invalid offer type." }, { status: 400 });
      }
      const parsed = parseRules(nextType, b.rules);
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
      data.rules = parsed.rules as Prisma.InputJsonValue;
    }
    if (b.menuId !== undefined) {
      if (b.menuId == null || b.menuId === "" || b.menuId === "all") {
        data.menu = { disconnect: true };
      } else {
        const mid = Math.floor(Number(b.menuId));
        const menu = await prisma.menu.findFirst({
          where: { id: mid, restaurantId: owned.restaurant.id },
          select: { id: true },
        });
        if (!menu) return NextResponse.json({ error: "Menu not found." }, { status: 404 });
        data.menu = { connect: { id: menu.id } };
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.menuOffer.update({ where: { id: offerId }, data });
      if (b.targets != null) {
        const targets = parseTargets(b.targets);
        await tx.menuOfferTarget.deleteMany({ where: { offerId } });
        if (targets.length) {
          await tx.menuOfferTarget.createMany({
            data: targets.map((t) => ({ offerId, kind: t.kind, refId: t.refId })),
          });
        }
      }
      return tx.menuOffer.findUniqueOrThrow({
        where: { id: offerId },
        include: { targets: { select: { kind: true, refId: true } } },
      });
    });

    await invalidateRestaurant(owned.restaurant.id, { menu: "all" });
    return NextResponse.json({ success: true, offer: serializeOffer(updated) });
  } catch (error) {
    const plan = planErrorResponse(error);
    if (plan) return plan;
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await requireWritable(userId);
    await requireEnabled(userId, "restaurant.offers");

    const { id } = await ctx.params;
    const offerId = parseInt(id, 10);
    if (!Number.isFinite(offerId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const owned = await loadOwnedOffer(userId, offerId);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.menuOffer.delete({ where: { id: offerId } });
    await invalidateRestaurant(owned.restaurant.id, { menu: "all" });
    return NextResponse.json({ success: true });
  } catch (error) {
    const plan = planErrorResponse(error);
    if (plan) return plan;
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
