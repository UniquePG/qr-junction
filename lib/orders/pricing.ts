export type PricedLine = {
  menuItemId: number;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type PriceQuote = {
  lines: PricedLine[];
  subtotal: number;
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
): PriceQuote {
  const priced = lines.map((line) => ({
    ...line,
    unitPrice: money(line.unitPrice),
    lineTotal: money(line.unitPrice * line.quantity),
  }));
  const subtotal = money(priced.reduce((sum, line) => sum + line.lineTotal, 0));
  const tax = money(subtotal * (Number(taxRate) || 0) / 100);
  return {
    lines: priced,
    subtotal,
    tax,
    total: money(subtotal + tax),
    currency,
    taxName,
    taxRate: Number(taxRate) || 0,
  };
}
