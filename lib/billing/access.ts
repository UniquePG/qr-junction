import type { AccessMode } from "./errors";

type SubscriptionAccess = {
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  currentPeriodEnd: Date | null;
  graceUntil: Date | null;
  graceDays?: number | null;
};

export function graceDeadline(subscription: SubscriptionAccess) {
  if (!subscription.currentPeriodEnd) return subscription.graceUntil;
  const fromDays = new Date(subscription.currentPeriodEnd.getTime() + Math.max(0, subscription.graceDays ?? 7) * 24 * 60 * 60 * 1000);
  if (subscription.graceUntil && subscription.graceUntil > fromDays) return subscription.graceUntil;
  return fromDays;
}

export function accessMode(subscription: SubscriptionAccess | null, now = new Date()): AccessMode {
  if (!subscription) return "full";
  const { status, currentPeriodEnd } = subscription;
  const periodOpen = !currentPeriodEnd || currentPeriodEnd > now;
  const deadline = graceDeadline(subscription);
  const graceOpen = Boolean(deadline && deadline > now);

  if (status === "ACTIVE" || status === "TRIALING") {
    if (periodOpen) return "full";
    return graceOpen ? "full" : "read_only";
  }
  if (status === "PAST_DUE") return graceOpen ? "full" : "read_only";
  if (status === "CANCELED") {
    if (periodOpen || graceOpen) return "full";
    return "read_only";
  }
  return "read_only";
}
