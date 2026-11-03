"use client";

import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/components/menu/types";
import { usePlate } from "@/components/menu/ordering/PlateContext";
import { useMenuLocaleOptional } from "@/components/menu/i18n/MenuLocaleProvider";

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
  const i18n = useMenuLocaleOptional();
  if (quantity <= 0) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAdd();
        }}
        className="inline-flex h-8 max-w-full shrink-0 cursor-pointer items-center gap-1 rounded-full border border-current/15 bg-white/90 px-2.5 text-xs font-semibold text-slate-800 shadow-sm sm:px-3"
      >
        <Plus className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate sm:hidden">{i18n?.t("add") || "Add"}</span>
        <span className="hidden truncate sm:inline">{label}</span>
      </button>
    );
  }

  return (
    <div
      className="inline-flex h-8 shrink-0 items-center rounded-full border border-current/15 bg-white text-slate-800 shadow-sm"
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
  const i18n = useMenuLocaleOptional();
  if (!plate?.enabled) return null;
  const variants = item.variants?.length ? item.variants : null;
  const active = variants ? (variantLabel || variants[0]?.label || null) : null;
  const quantity = plate.quantity(item.id, active);
  return (
    <div className="space-y-3 border-t border-current/10 pt-4">
      {variants ? (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{i18n?.t("choosePortion") || "Choose portion"}</p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {variants.map((variant) => {
              const selected = active === variant.label;
              return (
                <button
                  key={variant.label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onVariant(variant.label)}
                  className={`min-h-14 cursor-pointer rounded-2xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? "border-[#C4622D] bg-[#1C1410] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide">{variant.label}</span>
                  <span className={`mt-0.5 block text-base font-black ${selected ? "text-white" : "text-slate-900"}`}>
                    {currencySymbol}{Number(variant.price).toFixed(0)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="flex justify-end">
        <PlateControl
          label={plate.addLabel}
          quantity={quantity}
          onAdd={() => plate.add(item, active)}
          onChange={(next) => plate.setQuantity(item, active, next)}
        />
      </div>
    </div>
  );
}

export function PlateSlot({
  item,
  className = "",
  align = "end",
  inline = false,
}: {
  item: MenuItem;
  className?: string;
  align?: "end" | "start" | "center";
  inline?: boolean;
}) {
  const plate = usePlate();
  if (!plate?.enabled) return null;
  const variants = item.variants?.length ? item.variants : null;
  const quantity = variants ? plate.quantityForItem(item.id) : plate.quantity(item.id, null);
  const justify = align === "start" ? "justify-start" : align === "center" ? "justify-center" : "justify-end";
  return (
    <div
      className={`${inline ? "inline-flex shrink-0" : `flex w-full min-w-0 ${justify}`} ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
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
    </div>
  );
}
