export const LIFETIME_PERIOD = new Date(0);

export function kolkataMonthStart(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  return new Date(Date.UTC(year, month - 1, 1) - 5.5 * 60 * 60 * 1000);
}

export function periodStartFor(
  kind: "MONTHLY" | "LIFETIME",
  subscription: { currentPeriodStart: Date | null } | null,
  now = new Date(),
) {
  if (kind === "LIFETIME") return LIFETIME_PERIOD;
  if (subscription?.currentPeriodStart) return subscription.currentPeriodStart;
  return kolkataMonthStart(now);
}
