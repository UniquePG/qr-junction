import { resolveCallWaiterGate, resolveOrderingGate } from "@/lib/restaurant/gates";

/** Fields the public menu is allowed to receive. Address and licences stay on the owner profile. */
export const guestRestaurantSelect = {
  id: true,
  name: true,
  description: true,
  i18n: true,
  logoUrl: true,
  coverImage: true,
  currency: true,
  taxRate: true,
  taxName: true,
  orderingEnabled: true,
  callWaiterEnabled: true,
  settings: true,
  userId: true,
  phone: true,
  whatsapp: true,
  email: true,
  website: true,
  instagram: true,
  openingHours: true,
  showOpeningHours: true,
} as const;

type GuestRestaurantRow = {
  id: number;
  name: string;
  description: string | null;
  i18n: unknown;
  logoUrl: string | null;
  coverImage: string | null;
  currency: string;
  taxRate: unknown;
  taxName: string | null;
  orderingEnabled: boolean;
  callWaiterEnabled: boolean;
  settings: unknown;
  userId: number;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  openingHours: unknown;
  showOpeningHours: boolean;
};

/**
 * Strip owner-only fields and apply effective gates for guest UI.
 * `orderingEnabled` / `callWaiterEnabled` become effective switches (backward compatible).
 */
export async function toGuestRestaurant(restaurant: GuestRestaurantRow) {
  const [orderingGate, callWaiterGate] = await Promise.all([
    resolveOrderingGate({
      userId: restaurant.userId,
      orderingEnabled: restaurant.orderingEnabled,
      settings: restaurant.settings,
    }),
    resolveCallWaiterGate({
      userId: restaurant.userId,
      callWaiterEnabled: restaurant.callWaiterEnabled,
      settings: restaurant.settings,
    }),
  ]);

  const { userId: _userId, settings: _settings, ...publicFields } = restaurant;
  return {
    ...publicFields,
    orderingEnabled: orderingGate.effective,
    orderingPaused: orderingGate.reason === "OWNER_PAUSED",
    orderingUnlocked: orderingGate.unlocked && orderingGate.planAllows,
    callWaiterEnabled: callWaiterGate.effective,
  };
}
