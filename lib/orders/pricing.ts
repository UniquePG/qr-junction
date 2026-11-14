import type { OfferApplied } from "@/lib/offers/types";
import { applyOfferPricing, type OfferForPricing } from "@/lib/offers/pricing";

export type PricedLine = {
  menuItemId: number;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  listUnitPrice?: number;
  quantity: number;
  lineTotal: number;
  offerIds?: number[];
};

export type PriceQuote = {
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  offersApplied: OfferApplied[];
  tax: number;
  total: number;
  currency: string;
  taxName: string;
  taxRate: number;
};

function money(value: number) {
  return Math.round(value * 100) / 100;
}

export function quoteLines(
  lines: Array<{ menuItemId: number; name: string; variantLabel: string | null; unitPrice: number; quantity: number }>,
  taxRate: number,
  taxName: string,
  currency: string,
  offers: OfferForPricing[] = [],
): PriceQuote {
  const priced =
    offers.length > 0
      ? applyOfferPricing(lines, offers)
      : {
          lines: lines.map((line) => ({
            ...line,
            unitPrice: money(line.unitPrice),
            listUnitPrice: money(line.unitPrice),
            lineTotal: money(line.unitPrice * line.quantity),
            offerIds: [] as number[],
          })),
          discount: 0,
          offersApplied: [] as OfferApplied[],
          subtotal: money(lines.reduce((sum, line) => sum + money(line.unitPrice) * line.quantity, 0)),
        };

  const subtotal = money(priced.subtotal);
  const tax = money(subtotal * (Number(taxRate) || 0) / 100);
  return {
    lines: priced.lines,
    subtotal,
    discount: money(priced.discount),
    offersApplied: priced.offersApplied,
    tax,
    total: money(subtotal + tax),
    currency,
    taxName,
    taxRate: Number(taxRate) || 0,
  };
}
