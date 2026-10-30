import { DietMark, formatMoney } from "../shared";
import type { ThemeViewProps } from "../types";
import { PlateSlot } from "@/components/menu/ordering/PlateControl";

export default function BoardTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="space-y-6 overflow-x-clip">
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-[0.35em] text-amber-500 uppercase">Now boarding</p>
      </div>
      {categories.map((cat) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28">
          <div className="bg-[#12141a] border border-amber-900/40 px-3 py-2 mb-1">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-400 wrap-anywhere">{cat.name}</h3>
          </div>
          <div className="divide-y divide-amber-900/20 border border-amber-900/30 border-t-0">
            {cat.items.map((item) => (
              <div role="button" tabIndex={0}
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="w-full text-left bg-[#0b0c0f] px-3 py-2.5 cursor-pointer min-w-0"
              >
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <DietMark item={item} />
                    <span className="font-mono text-[13px] uppercase text-amber-100 wrap-anywhere">{item.name}</span>
                  </span>
                  <span className="flex-1 border-b border-dotted border-amber-700/50 min-w-3" />
                  <span className="font-mono text-[13px] text-amber-400 shrink-0">
                    {formatMoney(currencySymbol, item.variants?.[0]?.price ?? item.price)}
                  </span>
                </div>
                {item.variants && item.variants.length > 1 && (
                  <p className="font-mono text-[10px] text-amber-700 mt-1 pl-5">
                    {item.variants.map((variant) => `${variant.label} ${formatMoney(currencySymbol, variant.price)}`).join("  ·  ")}
                  </p>
                )}
                {item.isPopular && (
                  <span className="inline-block mt-1 font-mono text-[9px] uppercase tracking-widest text-[#0b0c0f] bg-amber-400 px-1.5 py-0.5">
                    Express
                  </span>
                )}
<div className="mt-2" onClick={(event) => event.stopPropagation()}><PlateSlot item={item} /></div>
</div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
