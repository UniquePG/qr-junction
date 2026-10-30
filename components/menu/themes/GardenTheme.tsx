import { Leaf } from "lucide-react";
import { DietMark, VariantPills, formatMoney } from "../shared";
import type { ThemeViewProps } from "../types";
import { PlateSlot } from "@/components/menu/ordering/PlateControl";

export default function GardenTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="space-y-10 overflow-x-clip">
      {categories.map((cat) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#2f5d3a] shrink-0" />
            <h3 className="font-serif text-xl text-[#2f5d3a] wrap-anywhere">{cat.name}</h3>
            <div className="flex-1 h-px bg-[#c5d4bf]" />
          </div>
          <div className="space-y-3">
            {cat.items.map((item) => (
              <div role="button" tabIndex={0}
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="w-full text-left bg-[#f7fbf4] border border-[#c5d4bf] rounded-2xl p-3 flex gap-3 min-w-0 cursor-pointer"
              >
                {item.image ? (
                  <img src={item.image} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#dce6d6] shrink-0 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-[#2f5d3a]/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm wrap-anywhere flex items-center gap-1.5">
                      <DietMark item={item} />
                      {item.name}
                    </h4>
                    {!item.variants?.length && (
                      <span className="text-sm font-black text-[#2f5d3a] shrink-0">{formatMoney(currencySymbol, item.price)}</span>
                    )}
                  </div>
                  {item.description && <p className="mt-1 text-[11px] text-[#5b6b5d] line-clamp-2">{item.description}</p>}
                  <VariantPills
                    item={item}
                    symbol={currencySymbol}
                    className="mt-2 text-[10px] border border-[#2f5d3a]/30 px-2 py-0.5 rounded-full"
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
