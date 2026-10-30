"use client";

import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/components/menu/types";
import { usePlate } from "@/components/menu/ordering/PlateContext";

export function PlateControl({
  label,
  quantity,
  onAdd,
  onChange,
}: {
  label: string;
  quantity: number;
  onAdd: () => void;
  onChange: (next: number) => void;
}) {
  if (quantity <= 0) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAdd();
        }}
        className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-current/15 bg-white/90 px-3 text-xs font-semibold text-slate-800 shadow-sm"
      >
        <Plus className="h-3.5 w-3.5" />
        {label}
      </button>
    );
  }

  return (
    <div
      className="inline-flex h-8 items-center rounded-full border border-current/15 bg-white text-slate-800 shadow-sm"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Remove one"
        onClick={() => onChange(quantity - 1)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-5 text-center text-sm font-bold">{quantity}</span>
      <button
        type="button"
        aria-label="Add one"
        onClick={() => onChange(quantity + 1)}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function DishOrderActions({
  item,
  variantLabel,
  onVariant,
  currencySymbol,
}: {
  item: MenuItem;
  variantLabel: string | null;
  onVariant: (label: string) => void;
  currencySymbol: string;
}) {
  const plate = usePlate();
  if (!plate?.enabled) return null;
  const variants = item.variants?.length ? item.variants : null;
  const active = variants ? (variantLabel || variants[0]?.label || null) : null;
  const quantity = plate.quantity(item.id, active);
  return (
    <div className="space-y-3 border-t border-current/10 pt-4">
      {variants ? (
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.label}
              type="button"
              onClick={() => onVariant(variant.label)}
              className={`cursor-pointer rounded-xl border px-3 py-2 text-left text-xs font-semibold ${active === variant.label ? "border-[#C4622D] bg-[#1C1410] text-white" : "border-slate-200 bg-white text-slate-900"}`}
            >
              {variant.label}
              <span className={`mt-0.5 block text-sm ${active === variant.label ? "text-white" : "text-slate-800"}`}>{currencySymbol}{Number(variant.price).toFixed(0)}</span>
            </button>
          ))}
        </div>
      ) : null}
      <PlateControl
        label={plate.addLabel}
        quantity={quantity}
        onAdd={() => plate.add(item, active)}
        onChange={(next) => plate.setQuantity(item, active, next)}
      />
    </div>
  );
}

export function PlateSlot({ item }: { item: MenuItem }) {
  const plate = usePlate();
  if (!plate?.enabled) return null;
  const variants = item.variants?.length ? item.variants : null;
  const quantity = variants ? plate.quantityForItem(item.id) : plate.quantity(item.id, null);
  return (
    <PlateControl
      label={plate.addLabel}
      quantity={quantity}
      onAdd={() => (variants ? plate.openItem(item) : plate.add(item, null))}
      onChange={(next) => {
        if (variants) {
          plate.openItem(item);
          return;
        }
        plate.setQuantity(item, null, next);
      }}
    />
  );
}
