import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { planErrorResponse } from "@/lib/billing/errors";
import { allows, requireEnabled, requireWritable } from "@/lib/billing/guard";
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

async function ownedRestaurant(userId: number) {
  return prisma.restaurant.findUnique({
    where: { userId },
    select: { id: true },
  });
}

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

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await ownedRestaurant(userId);
    if (!restaurant) {
      return NextResponse.json({ success: true, offers: [], entitlements: { offers: false, custom: false } });
    }

    const url = new URL(request.url);
    const menuIdRaw = url.searchParams.get("menuId");
    const menuId = menuIdRaw ? parseInt(menuIdRaw, 10) : null;

    const offers = await prisma.menuOffer.findMany({
      where: {
        restaurantId: restaurant.id,
        ...(menuId && Number.isFinite(menuId) ? { OR: [{ menuId: null }, { menuId }] } : {}),
      },
      include: { targets: { select: { kind: true, refId: true } } },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      offers: offers.map(serializeOffer),
      entitlements: {
        offers: await allows(userId, "restaurant.offers"),
        custom: await allows(userId, "restaurant.offers.custom"),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await requireWritable(userId);
    await requireEnabled(userId, "restaurant.offers");

    const restaurant = await ownedRestaurant(userId);
    if (!restaurant) {
      return NextResponse.json({ error: "Create your restaurant profile first." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const type = (body as { type?: unknown }).type;
    if (!isMenuOfferType(type)) {
      return NextResponse.json({ error: "Pick a valid offer type." }, { status: 400 });
    }

    const title = String((body as { title?: unknown }).title || "").trim().slice(0, 80);
    if (title.length < 2) {
      return NextResponse.json({ error: "Add a short title for this offer." }, { status: 400 });
    }

    const parsed = parseRules(type, (body as { rules?: unknown }).rules);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const targets = parseTargets((body as { targets?: unknown }).targets);
    if (
      (type === "ITEM_DISCOUNT" || type === "BOGO") &&
      !targets.some((t) => t.kind === "ITEM" || t.kind === "CATEGORY")
    ) {
      return NextResponse.json({ error: "Pick at least one item or category." }, { status: 400 });
    }
    if (type === "COLLECTION" && (parsed.rules as { mode?: string }).mode === "manual" && !targets.length) {
      return NextResponse.json({ error: "Pick items for this collection." }, { status: 400 });
    }

    const schedule = parseSchedule((body as { schedule?: unknown }).schedule);
    const hasCustomSchedule =
      Boolean(schedule?.windows?.length) || Boolean(schedule?.daysOfWeek?.length);
    if (hasCustomSchedule) {
      await requireEnabled(userId, "restaurant.offers.custom");
    }

    let menuId: number | null = null;
    const menuIdRaw = (body as { menuId?: unknown }).menuId;
    if (menuIdRaw != null && menuIdRaw !== "" && menuIdRaw !== "all") {
      const id = Math.floor(Number(menuIdRaw));
      if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid menu." }, { status: 400 });
      }
      const menu = await prisma.menu.findFirst({
        where: { id, restaurantId: restaurant.id },
        select: { id: true },
      });
      if (!menu) return NextResponse.json({ error: "Menu not found." }, { status: 404 });
      menuId = menu.id;
    }

    const statusRaw = String((body as { status?: unknown }).status || "DRAFT").toUpperCase();
    const status = (["DRAFT", "ACTIVE", "PAUSED"].includes(statusRaw) ? statusRaw : "DRAFT") as MenuOfferStatus;

    const startsAtRaw = (body as { startsAt?: unknown }).startsAt;
    const endsAtRaw = (body as { endsAt?: unknown }).endsAt;
    const startsAt = startsAtRaw ? new Date(String(startsAtRaw)) : null;
    const endsAt = endsAtRaw ? new Date(String(endsAtRaw)) : null;
    if (startsAt && Number.isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "Invalid start date." }, { status: 400 });
    }
    if (endsAt && Number.isNaN(endsAt.getTime())) {
      return NextResponse.json({ error: "Invalid end date." }, { status: 400 });
    }

    const offer = await prisma.$transaction(async (tx) => {
      const created = await tx.menuOffer.create({
        data: {
          restaurantId: restaurant.id,
          menuId,
          type,
          status,
          title,
          subtitle: String((body as { subtitle?: unknown }).subtitle || "").trim().slice(0, 160) || null,
          badgeLabel: String((body as { badgeLabel?: unknown }).badgeLabel || "").trim().slice(0, 24) || null,
          imageUrl: String((body as { imageUrl?: unknown }).imageUrl || "").trim().slice(0, 500) || null,
          priority: Math.max(0, Math.min(1000, Math.floor(Number((body as { priority?: unknown }).priority) || 0))),
          startsAt,
          endsAt,
          schedule: schedule ? (schedule as Prisma.InputJsonValue) : undefined,
          rules: parsed.rules as Prisma.InputJsonValue,
          presentation: parsePresentation((body as { presentation?: unknown }).presentation) as
            | Prisma.InputJsonValue
            | undefined,
        },
      });
      if (targets.length) {
        await tx.menuOfferTarget.createMany({
          data: targets.map((t) => ({ offerId: created.id, kind: t.kind, refId: t.refId })),
        });
      }
      return tx.menuOffer.findUniqueOrThrow({
        where: { id: created.id },
        include: { targets: { select: { kind: true, refId: true } } },
      });
    });

    await invalidateRestaurant(restaurant.id, { menu: "all" });

    return NextResponse.json({ success: true, offer: serializeOffer(offer) }, { status: 201 });
  } catch (error) {
    const plan = planErrorResponse(error);
    if (plan) return plan;
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
