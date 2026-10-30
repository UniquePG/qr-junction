export function estimatePrepMinutes(input: {
  baseMinutes: number;
  itemCount: number;
  queueAhead: number;
}) {
  const base = clamp(Math.round(Number(input.baseMinutes) || 12), 5, 90);
  const extraDishes = Math.max(0, Math.round(input.itemCount) - 3);
  const queue = Math.max(0, Math.round(input.queueAhead));
  return clamp(base + extraDishes * 2 + queue * 4, 5, 120);
}

export function waitLabel(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return null;
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return null;
  const clock = new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const mins = Math.ceil((at - now) / 60000);
  if (mins <= 0) return { short: "Any moment now", clock };
  if (mins === 1) return { short: "About a minute", clock };
  return { short: `About ${mins} min`, clock };
}

export function stageWindowMinutes(status: string, prepMinutes = 12) {
  const prep = clamp(Math.round(Number(prepMinutes) || 12), 5, 90);
  switch (status) {
    case "PLACED":
      return 5;
    case "ACCEPTED":
      return Math.max(5, Math.round(prep * 0.3));
    case "PREPARING":
      return prep;
    case "READY":
      return 5;
    default:
      return 5;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
