import type { MenuItem } from "./types";
import { StrikePrice } from "@/components/menu/offers/StrikePrice";
import { useOfferTheme } from "@/components/menu/offers/OfferContext";

export function formatMoney(symbol: string, value: any, digits = 0) {
  const n = Number(value);
  if (Number.isNaN(n)) return `${symbol}0`;
  return `${symbol}${n.toFixed(digits)}`;
}

/** Base price with optional offer strike — use in themes for item list price. */
export function ItemPrice({
  item,
  symbol,
  className = "",
  price,
}: {
  item: Pick<MenuItem, "id" | "price">;
  symbol: string;
  className?: string;
  /** Override (e.g. first variant). */
  price?: any;
}) {
  const theme = useOfferTheme();
  return (
    <StrikePrice
      itemId={item.id}
      listPrice={price ?? item.price}
      symbol={symbol}
      theme={theme}
      className={className}
    />
  );
}

export function DietMark({ item, size = "sm" }: { item: MenuItem; size?: "sm" | "md" }) {
  const box = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  const inner = size === "md" ? "w-1.5 h-1.5" : "w-1.5 h-1.5";
  if (item.isNonVeg) {
    return (
      <span className={`${box} rounded border border-red-500 flex items-center justify-center shrink-0 bg-white/90`} aria-label="Non-veg">
        <span className={`${inner} bg-red-500 rotate-45`} />
      </span>
    );
  }
  if (item.isVeg || item.isVegan) {
    return (
      <span className={`${box} rounded border border-emerald-500 flex items-center justify-center shrink-0 bg-white/90`} aria-label="Veg">
        <span className={`${inner} rounded-full bg-emerald-500`} />
      </span>
    );
  }
  return null;
}

export function VariantPills({
  item,
  symbol,
  className,
}: {
  item: MenuItem;
  symbol: string;
  className: string;
}) {
  if (!item.variants?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {item.variants.map((variant, index) => (
        <span key={`${variant.label}-${index}`} className={className}>
          {variant.label} {formatMoney(symbol, variant.price)}
        </span>
      ))}
    </div>
  );
}
