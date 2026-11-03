import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MENU_LOCALE,
  MENU_I18N_LABELS,
  MENU_I18N_NATIVE_LABELS,
  isMenuLocaleCode,
  type MenuLocaleCode,
} from "./locales";

export type GuestLocalePayload = {
  code: MenuLocaleCode;
  label: string;
  nativeLabel: string;
};

/** Active + ready locales for the guest language switcher. */
export async function loadGuestLocales(restaurantId: number): Promise<GuestLocalePayload[]> {
  const rows = await prisma.restaurantLocale.findMany({
    where: {
      restaurantId,
      active: true,
      status: "ready",
    },
    select: { code: true },
    orderBy: { code: "asc" },
  });

  const codes = rows
    .map((row) => row.code)
    .filter(isMenuLocaleCode);

  const unique = Array.from(new Set<MenuLocaleCode>([
    DEFAULT_MENU_LOCALE,
    ...codes,
  ]));

  return unique.map((code) => ({
    code,
    label: MENU_I18N_LABELS[code],
    nativeLabel: MENU_I18N_NATIVE_LABELS[code],
  }));
}
