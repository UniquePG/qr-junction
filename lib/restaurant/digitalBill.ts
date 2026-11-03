import { allows } from "@/lib/billing/guard";
import { getRestaurantSettings } from "@/lib/restaurant/settings";

/** Preference on AND plan entitlement allows. */
export async function isDigitalBillEffective(
  ownerUserId: number,
  settingsRaw: unknown,
): Promise<boolean> {
  const settings = getRestaurantSettings(settingsRaw);
  if (!settings.digitalBill) return false;
  return allows(ownerUserId, "restaurant.orders.digital_bill");
}
