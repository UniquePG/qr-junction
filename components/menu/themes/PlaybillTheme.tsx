import { DietMark, formatMoney, ItemPrice } from "../shared";
import { ItemTags } from "../ItemTags";
import type { ThemeViewProps } from "../types";
import { PlateSlot } from "@/components/menu/ordering/PlateControl";

export default function PlaybillTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="space-y-12 overflow-x-clip max-w-xl mx-auto">
      {categories.map((cat, index) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 text-center space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#e8c39e]">Act {index + 1}</p>
            <h3 className="font-serif text-2xl text-[#f6ead8] wrap-anywhere">{cat.name}</h3>
            <div className="mx-auto w-16 h-px bg-[#e8c39e]/50" />
          </div>
          <div className="space-y-3">
            {cat.items.map((item) => (
              <div role="button" tabIndex={0}
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="w-full text-center bg-transparent border-none cursor-pointer min-w-0 py-1"
              >
                <h4 className="font-serif text-base text-[#f6ead8] wrap-anywhere flex items-center justify-center gap-1.5">
                  <DietMark item={item} />
                  <span className="min-w-0">{item.name}</span>
                </h4>
                {item.description && (
                  <p className="mt-1 text-[11px] italic text-[#c9b49a] line-clamp-2">{item.description}</p>
                )}
                <p className="mt-1 text-xs tracking-[0.2em] text-[#e8c39e]">
                  {item.variants?.length ? (
                    item.variants.map((variant) => `${variant.label} ${formatMoney(currencySymbol, variant.price)}`).join("  ·  ")
                  ) : (
                    <ItemPrice item={item} symbol={currencySymbol} />
                  )}
                </p>
                {item.isPopular && (
                  <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-[#e8c39e]">Encore</p>
                )}
                <ItemTags item={item} hidePopular className="mt-1 justify-center" />
                <PlateSlot item={item} className="mt-2" align="center" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
