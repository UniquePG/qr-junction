import { NextResponse } from "next/server";
import { after } from "next/server";
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
import { restaurantAuth, restaurantErrorResponse } from "@/lib/restaurant/http";
import { auditFromContext, clientIp } from "@/lib/restaurant/audit";

function planAllowedCodes(feature: {
  quota: number;
  allowlist: string[];
}): MenuLocaleCode[] {
  if (feature.quota < 0) return [...MENU_I18N_CODES];
  return MENU_I18N_CODES.filter((code) => feature.allowlist.includes(code));
}

export async function GET(request: Request) {
  try {
    const auth = await restaurantAuth(request, "menu.view");
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;
    const ownerUserId = ctx.ownerUserId;

    await ensureEnglishLocale(restaurantId);

    const feature = await resolveOne(ownerUserId, "restaurant.menu.languages");
    const allowed = planAllowedCodes(feature);

    const rows = await prisma.restaurantLocale.findMany({
      where: { restaurantId },
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
    return restaurantErrorResponse(error, "Internal Server Error");
  }
}

export async function POST(request: Request) {
  try {
    const auth = await restaurantAuth(request, "menu.update");
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;
    const ownerUserId = ctx.ownerUserId;

    const body = await request.json().catch(() => ({}));
    const code = body?.code;
    if (!isMenuLocaleCode(code) || !isTranslatableLocale(code)) {
      return NextResponse.json({ error: "Unsupported language code" }, { status: 400 });
    }

    await requireWritable(ownerUserId);
    await requireAllowed(ownerUserId, "restaurant.menu.languages", code);
    await ensureEnglishLocale(restaurantId);

    const locale = await prisma.restaurantLocale.upsert({
      where: { restaurantId_code: { restaurantId, code } },
      create: {
        restaurantId,
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
      startLocaleTranslationJob(restaurantId, code);
    });

    auditFromContext(ctx, {
      action: "locale.enable",
      resourceType: "locale",
      resourceId: code,
      summary: `Enabled menu language ${MENU_I18N_LABELS[code]}`,
      meta: { code },
      ip: clientIp(request),
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
    return restaurantErrorResponse(error, "Internal Server Error");
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await restaurantAuth(request, "menu.update");
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;
    const ownerUserId = ctx.ownerUserId;

    const body = await request.json().catch(() => ({}));
    const code = body?.code;
    if (!isMenuLocaleCode(code)) {
      return NextResponse.json({ error: "Unsupported language code" }, { status: 400 });
    }

    if (code === DEFAULT_MENU_LOCALE) {
      return NextResponse.json({ error: "English cannot be disabled" }, { status: 400 });
    }

    await requireWritable(ownerUserId);

    const action = typeof body?.action === "string" ? body.action : "";
    const existing = await prisma.restaurantLocale.findUnique({
      where: { restaurantId_code: { restaurantId, code } },
    });

    if (action === "deactivate") {
      if (!existing) {
        return NextResponse.json({ error: "Language is not enabled" }, { status: 404 });
      }
      const locale = await prisma.restaurantLocale.update({
        where: { id: existing.id },
        data: { active: false },
      });
      auditFromContext(ctx, {
        action: "locale.disable",
        resourceType: "locale",
        resourceId: code,
        summary: `Disabled menu language ${MENU_I18N_LABELS[code]}`,
        meta: { code },
        ip: clientIp(request),
      });
      return NextResponse.json({ success: true, locale });
    }

    if (action === "activate") {
      await requireAllowed(ownerUserId, "restaurant.menu.languages", code);
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
      auditFromContext(ctx, {
        action: "locale.enable",
        resourceType: "locale",
        resourceId: code,
        summary: `Enabled menu language ${MENU_I18N_LABELS[code]}`,
        meta: { code },
        ip: clientIp(request),
      });
      return NextResponse.json({ success: true, locale });
    }

    if (action === "retry") {
      await requireAllowed(ownerUserId, "restaurant.menu.languages", code);
      const locale = await prisma.restaurantLocale.upsert({
        where: { restaurantId_code: { restaurantId, code } },
        create: {
          restaurantId,
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
        startLocaleTranslationJob(restaurantId, code);
      });
      return NextResponse.json({ success: true, locale });
    }

    return NextResponse.json(
      { error: "action must be activate, deactivate, or retry" },
      { status: 400 },
    );
  } catch (error) {
    return restaurantErrorResponse(error, "Internal Server Error");
  }
}
