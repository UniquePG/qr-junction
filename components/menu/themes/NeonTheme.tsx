import { Flame } from "lucide-react";
import { DietMark, VariantPills, formatMoney } from "../shared";
import type { ThemeViewProps } from "../types";
import { PlateSlot } from "@/components/menu/ordering/PlateControl";

export default function NeonTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="space-y-8 overflow-x-clip">
      {categories.map((cat) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 space-y-3">
          <div className="flex items-end justify-between gap-3 px-0.5">
            <h3 className="text-lg font-black text-[#ff4d9a] wrap-anywhere">{cat.name}</h3>
            <span className="text-[10px] text-[#2de2e6] shrink-0">swipe</span>
          </div>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-none">
            {cat.items.map((item) => (
              <div role="button" tabIndex={0}
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="snap-start shrink-0 w-[78%] max-w-[320px] text-left bg-[#140c22] border border-[#3a1d55] rounded-3xl overflow-hidden cursor-pointer"
              >
                <div className="h-40 bg-[#1b1030] relative">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#ff4d9a]/20 to-[#2de2e6]/10" />
                  )}
                  {item.isPopular && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[9px] font-black uppercase bg-[#ff4d9a] text-[#0a0612] px-2 py-1 rounded-full">
                      <Flame className="w-3 h-3" /> Hot
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-[#f5f0ff] wrap-anywhere flex items-center gap-1.5">
                      <DietMark item={item} />
                      {item.name}
                    </h4>
                    {!item.variants?.length && (
                      <span className="text-[#2de2e6] font-black shrink-0">{formatMoney(currencySymbol, item.price)}</span>
                    )}
                  </div>
                  {item.description && <p className="text-[11px] text-[#c9b6e0] line-clamp-2">{item.description}</p>}
                  <VariantPills
                    item={item}
                    symbol={currencySymbol}
                    className="text-[10px] font-bold text-[#0a0612] bg-[#2de2e6] px-2 py-0.5 rounded-full"
                  />
                </div>
<div className="mt-2" onClick={(event) => event.stopPropagation()}><PlateSlot item={item} /></div>
</div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
