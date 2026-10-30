export const ORDER_STATUSES = ["PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED", "REJECTED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const FORWARD: Record<string, number> = {
  PLACED: 0,
  ACCEPTED: 1,
  PREPARING: 2,
  READY: 3,
  SERVED: 4,
};

export function canMoveStatus(from: OrderStatus, to: OrderStatus) {
  if (from === "SERVED" || from === "REJECTED") return false;
  if (to === "REJECTED") return from === "PLACED";
  if (to === "PLACED") return false;
  if (from === "PLACED") return to === "ACCEPTED";
  const fromRank = FORWARD[from];
  const toRank = FORWARD[to];
  return toRank !== undefined && fromRank !== undefined && toRank > fromRank;
}

export function ownerStage(status: string) {
  switch (status) {
    case "PLACED":
      return {
        title: "Time to accept or reject",
        hint: "Accept the plate, or reject it with a short reason.",
        action: "Accept",
        next: "ACCEPTED" as const,
      };
    case "ACCEPTED":
      return {
        title: "Time to start cooking",
        hint: "The next step is to start cooking.",
        action: "Start cooking",
        next: "PREPARING" as const,
      };
    case "PREPARING":
      return {
        title: "Time to finish cooking",
        hint: "Mark the plate ready when it can leave the kitchen.",
        action: "Mark ready",
        next: "READY" as const,
      };
    case "READY":
      return {
        title: "Time to serve",
        hint: "Mark served when the plate reaches the table.",
        action: "Mark served",
        next: "SERVED" as const,
      };
    default:
      return null;
  }
}

export function customerStatusCopy(status: string, rejectReason?: string | null) {
  switch (status) {
    case "PLACED":
      return "Sent to the kitchen";
    case "ACCEPTED":
      return "The kitchen has your plate";
    case "PREPARING":
      return "On the fire";
    case "READY":
      return "On its way";
    case "SERVED":
      return "At your table";
    case "REJECTED":
      return rejectReason ? `The kitchen couldn't take this. ${rejectReason}` : "The kitchen couldn't take this";
    default:
      return "Sent to the kitchen";
  }
}
