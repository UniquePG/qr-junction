import { DietMark, formatMoney } from "../shared";
import type { ThemeViewProps } from "../types";
import { PlateSlot } from "@/components/menu/ordering/PlateControl";

export default function TicketTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="max-w-md mx-auto overflow-x-clip">
      <div className="bg-[#f7f1df] text-[#1c1914] shadow-[0_8px_0_#c9b78a] border border-[#c9b78a]">
        <div className="px-4 py-3 border-b border-dashed border-[#1c1914]/40 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] font-black">Guest check</p>
          <p className="font-mono text-[11px] mt-1">ORDER · OPEN TABLE</p>
        </div>

        {categories.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 px-3 py-3 border-b border-dashed border-[#1c1914]/30">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] mb-2 wrap-anywhere">{cat.name}</h3>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <div role="button" tabIndex={0}
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="w-full text-left bg-transparent border-none cursor-pointer min-w-0"
                >
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <DietMark item={item} />
                      <span className="font-mono text-[13px] uppercase wrap-anywhere">{item.name}</span>
                    </span>
                    <span className="flex-1 border-b border-dotted border-[#1c1914]/50 min-w-4" />
                    <span className="font-mono text-[13px] font-bold shrink-0">
                      {formatMoney(currencySymbol, item.variants?.[0]?.price ?? item.price)}
                    </span>
                  </div>
                  {item.variants && item.variants.length > 1 && (
                    <p className="font-mono text-[10px] text-[#6b6250] mt-0.5 pl-5">
                      {item.variants.map((variant) => `${variant.label} ${formatMoney(currencySymbol, variant.price)}`).join(" · ")}
                    </p>
                  )}
                  {item.isPopular && (
                    <span className="inline-block mt-1 font-mono text-[9px] uppercase tracking-widest text-[#b42318] border border-[#b42318] px-1.5 py-0.5">
                      House pick
                    </span>
                  )}
<div className="mt-2" onClick={(event) => event.stopPropagation()}><PlateSlot item={item} /></div>
</div>
              ))}
            </div>
          </section>
        ))}

        <div className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-[#6b6250]">
          Thank you · Please ask for today&apos;s specials
        </div>
      </div>
    </div>
  );
}
