import { NextResponse } from "next/server";
import { after } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { planErrorResponse } from "@/lib/billing/errors";
import { requireAllowed, requireWritable } from "@/lib/billing/guard";
import { resolveOne } from "@/lib/billing/resolve";
import {
  DEFAULT_MENU_LOCALE,
  isMenuLocaleCode,
  isTranslatableLocale,
  MENU_I18N_CODES,
  MENU_I18N_LABELS,
  type MenuLocaleCode,
} from "@/lib/menu/i18n/locales";
import {
  ensureEnglishLocale,
  startLocaleTranslationJob,
} from "@/lib/menu/i18n/sync";
import { prisma } from "@/lib/prisma";

async function getOwnedRestaurant(userId: number) {
  return prisma.restaurant.findUnique({
    where: { userId },
    select: { id: true },
  });
}

function planAllowedCodes(feature: {
  quota: number;
  allowlist: string[];
}): MenuLocaleCode[] {
  if (feature.quota < 0) return [...MENU_I18N_CODES];
  return MENU_I18N_CODES.filter((code) => feature.allowlist.includes(code));
}

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await getOwnedRestaurant(userId);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant profile not found" }, { status: 400 });
    }

    await ensureEnglishLocale(restaurant.id);

    const feature = await resolveOne(userId, "restaurant.menu.languages");
    const allowed = planAllowedCodes(feature);

    const rows = await prisma.restaurantLocale.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { code: "asc" },
    });

    const byCode = new Map(rows.map((row) => [row.code, row]));

    const locales = MENU_I18N_CODES.map((code) => {
      const row = byCode.get(code);
      return {
        code,
        label: MENU_I18N_LABELS[code],
        allowed: allowed.includes(code),
        locked: code === DEFAULT_MENU_LOCALE,
        active: code === DEFAULT_MENU_LOCALE ? true : Boolean(row?.active),
        status: row?.status || (code === DEFAULT_MENU_LOCALE ? "ready" : "ready"),
        lastError: row?.lastError ?? null,
        lastTranslatedAt: row?.lastTranslatedAt ?? null,
        enabledInDb: Boolean(row),
      };
    });

    return NextResponse.json({
      success: true,
      locales,
      planAllowed: allowed,
    });
  } catch (error) {
    const denied = planErrorResponse(error);
    if (denied) return denied;
    console.error("Error listing menu locales:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await getOwnedRestaurant(userId);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant profile not found" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const code = body?.code;
    if (!isMenuLocaleCode(code) || !isTranslatableLocale(code)) {
      return NextResponse.json({ error: "Unsupported language code" }, { status: 400 });
    }

    await requireWritable(userId);
    await requireAllowed(userId, "restaurant.menu.languages", code);
    await ensureEnglishLocale(restaurant.id);

    const locale = await prisma.restaurantLocale.upsert({
      where: { restaurantId_code: { restaurantId: restaurant.id, code } },
      create: {
        restaurantId: restaurant.id,
        code,
        active: true,
        status: "pending",
        lastError: null,
      },
      update: {
        active: true,
        status: "pending",
        lastError: null,
      },
    });

    after(() => {
      startLocaleTranslationJob(restaurant.id, code);
    });

    return NextResponse.json({
      success: true,
      locale: {
        code: locale.code,
        active: locale.active,
        status: "pending",
        label: MENU_I18N_LABELS[code],
      },
    });
  } catch (error) {
    const denied = planErrorResponse(error);
    if (denied) return denied;
    console.error("Error enabling menu locale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await getOwnedRestaurant(userId);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant profile not found" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const code = body?.code;
    if (!isMenuLocaleCode(code)) {
      return NextResponse.json({ error: "Unsupported language code" }, { status: 400 });
    }

    if (code === DEFAULT_MENU_LOCALE) {
      return NextResponse.json({ error: "English cannot be disabled" }, { status: 400 });
    }

    await requireWritable(userId);

    const action = typeof body?.action === "string" ? body.action : "";
    const existing = await prisma.restaurantLocale.findUnique({
      where: { restaurantId_code: { restaurantId: restaurant.id, code } },
    });

    if (action === "deactivate") {
      if (!existing) {
        return NextResponse.json({ error: "Language is not enabled" }, { status: 404 });
      }
      const locale = await prisma.restaurantLocale.update({
        where: { id: existing.id },
        data: { active: false },
      });
      return NextResponse.json({ success: true, locale });
    }

    if (action === "activate") {
      await requireAllowed(userId, "restaurant.menu.languages", code);
      if (!existing) {
        return NextResponse.json(
          { error: "Enable the language first so translations can be generated" },
          { status: 400 },
        );
      }
      const locale = await prisma.restaurantLocale.update({
        where: { id: existing.id },
        data: { active: true },
      });
      return NextResponse.json({ success: true, locale });
    }

    if (action === "retry") {
      await requireAllowed(userId, "restaurant.menu.languages", code);
      const locale = await prisma.restaurantLocale.upsert({
        where: { restaurantId_code: { restaurantId: restaurant.id, code } },
        create: {
          restaurantId: restaurant.id,
          code,
          active: true,
          status: "pending",
          lastError: null,
        },
        update: {
          active: true,
          status: "pending",
          lastError: null,
        },
      });
      after(() => {
        startLocaleTranslationJob(restaurant.id, code);
      });
      return NextResponse.json({ success: true, locale });
    }

    return NextResponse.json(
      { error: "action must be activate, deactivate, or retry" },
      { status: 400 },
    );
  } catch (error) {
    const denied = planErrorResponse(error);
    if (denied) return denied;
    console.error("Error updating menu locale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
