export const WAITER_REASONS = ["BILL", "WATER", "ASSISTANCE", "OTHER"] as const;
export type WaiterReason = (typeof WAITER_REASONS)[number];

export const WAITER_STATUSES = ["PENDING", "ACKNOWLEDGED"] as const;
export type WaiterStatus = (typeof WAITER_STATUSES)[number];

export const WAITER_COOLDOWN_SECONDS = 120;
export const WAITER_MAX_PENDING_PER_RESTAURANT = 3;

export const WAITER_REASON_LABELS: Record<WaiterReason, string> = {
  BILL: "Bill",
  WATER: "Water",
  ASSISTANCE: "Assistance",
  OTHER: "Other",
};

export function isWaiterReason(value: unknown): value is WaiterReason {
  return typeof value === "string" && (WAITER_REASONS as readonly string[]).includes(value);
}

export function isWaiterStatus(value: unknown): value is WaiterStatus {
  return typeof value === "string" && (WAITER_STATUSES as readonly string[]).includes(value);
}
