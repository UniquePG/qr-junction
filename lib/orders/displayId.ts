/**
 * Display-only call codes for verbal handoff between staff and guests.
 * Derived from existing `publicId` + `tableNumber` — never stored.
 */

export function normalizePlaceToken(tableNumber?: string | null): string {
  const raw = String(tableNumber || "").trim();
  if (!raw) return "CTR";

  const withoutLabel = raw.replace(/^(table|tbl|t)\s*/i, "").trim();
  const token = (withoutLabel || raw)
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);

  if (!token) return "CTR";
  return token.startsWith("T") ? token : `T${token}`;
}

function orderTail(publicId: string): string {
  const body = String(publicId || "")
    .trim()
    .replace(/^ord_/i, "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "");

  if (body.length >= 4) return body.slice(-4);
  if (body.length > 0) return body.padStart(4, "0");
  return "0000";
}

/** Speakable label, e.g. `#T1-E5G4` or `#CTR-E5G4`. */
export function orderCallCode(publicId: string, tableNumber?: string | null): string {
  return `#${normalizePlaceToken(tableNumber)}-${orderTail(publicId)}`;
}
