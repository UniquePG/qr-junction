import type { OfferSchedule } from "./types";

const DEFAULT_TZ = "Asia/Kolkata";

function partsInTz(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const bits = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const day = weekdayMap[bits.weekday || ""] ?? date.getDay();
  const hhmm = `${bits.hour || "00"}:${bits.minute || "00"}`;
  return { day, hhmm };
}

function inWindow(hhmm: string, start: string, end: string) {
  if (start === end) return true;
  if (start < end) return hhmm >= start && hhmm < end;
  // overnight window e.g. 22:00–02:00
  return hhmm >= start || hhmm < end;
}

/** True when the offer is live for the given instant (status/dates handled by caller). */
export function isOfferInSchedule(
  schedule: OfferSchedule | null | undefined,
  at: Date = new Date(),
  fallbackTz = DEFAULT_TZ,
): boolean {
  if (!schedule) return true;
  const tz = schedule.timezone || fallbackTz;
  let day: number;
  let hhmm: string;
  try {
    ({ day, hhmm } = partsInTz(at, tz));
  } catch {
    ({ day, hhmm } = partsInTz(at, DEFAULT_TZ));
  }

  if (schedule.daysOfWeek?.length && !schedule.daysOfWeek.includes(day)) return false;
  if (schedule.windows?.length) {
    return schedule.windows.some((w) => inWindow(hhmm, w.start, w.end));
  }
  return true;
}

export function isOfferWithinDateRange(
  startsAt: Date | null | undefined,
  endsAt: Date | null | undefined,
  at: Date = new Date(),
): boolean {
  if (startsAt && at < startsAt) return false;
  if (endsAt && at > endsAt) return false;
  return true;
}

export { DEFAULT_TZ as DEFAULT_OFFER_TZ };
