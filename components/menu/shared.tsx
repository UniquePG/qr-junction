import type { MenuItem } from "./types";

export function formatMoney(symbol: string, value: any, digits = 0) {
  const n = Number(value);
  if (Number.isNaN(n)) return `${symbol}0`;
  return `${symbol}${n.toFixed(digits)}`;
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
