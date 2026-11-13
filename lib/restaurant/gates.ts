import { allows } from "@/lib/billing/guard";
import { getRestaurantSettings } from "@/lib/restaurant/settings";

export type OrderingGateReason = "PLAN_OFF" | "ADMIN_OFF" | "OWNER_PAUSED" | null;

export type OrderingGateResult = {
  effective: boolean;
  unlocked: boolean;
  acceptingOrders: boolean;
  planAllows: boolean;
  canManageAcceptingOrders: boolean;
  reason: OrderingGateReason;
};

export function getAcceptingOrders(settingsRaw: unknown): boolean {
  return getRestaurantSettings(settingsRaw).acceptingOrders;
}

export function isOrderingUnlocked(orderingEnabled: boolean | null | undefined): boolean {
  return orderingEnabled === true;
}

/**
 * Dual-authority ordering gate:
 * plan entitlement AND admin unlock AND owner accepting preference.
 */
export async function resolveOrderingGate(input: {
  userId: number;
  orderingEnabled: boolean;
  settings: unknown;
}): Promise<OrderingGateResult> {
  const unlocked = isOrderingUnlocked(input.orderingEnabled);
  const acceptingOrders = getAcceptingOrders(input.settings);
  const planAllows = await allows(input.userId, "restaurant.ordering");
  const canManageAcceptingOrders = unlocked && planAllows;

  let reason: OrderingGateReason = null;
  if (!planAllows) reason = "PLAN_OFF";
  else if (!unlocked) reason = "ADMIN_OFF";
  else if (!acceptingOrders) reason = "OWNER_PAUSED";

  return {
    effective: planAllows && unlocked && acceptingOrders,
    unlocked,
    acceptingOrders,
    planAllows,
    canManageAcceptingOrders,
    reason,
  };
}

export async function isOrderingEffective(input: {
  userId: number;
  orderingEnabled: boolean;
  settings: unknown;
}): Promise<boolean> {
  const gate = await resolveOrderingGate(input);
  return gate.effective;
}
