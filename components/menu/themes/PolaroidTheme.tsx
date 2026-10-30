import { DietMark, VariantPills, formatMoney } from "../shared";
import type { ThemeViewProps } from "../types";
import { PlateSlot } from "@/components/menu/ordering/PlateControl";

export default function PolaroidTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="space-y-10 overflow-x-clip">
      {categories.map((cat) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c45c26] shrink-0" />
            <h3 className="text-lg font-black text-[#3d2a1a] wrap-anywhere">{cat.name}</h3>
            <div className="flex-1 h-px bg-[#c4ae8a]" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {cat.items.map((item, index) => (
              <div role="button" tabIndex={0}
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`min-w-0 text-left bg-white border border-[#efe7d8] p-2 pb-3 cursor-pointer shadow-sm ${
                  index % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]"
                }`}
              >
                <div className="aspect-square bg-[#e8dcc6] overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#d8c8aa]" />
                  )}
                </div>
                <div className="mt-2 px-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-[#3d2a1a] leading-snug wrap-anywhere flex items-center gap-1">
                    <DietMark item={item} />
                    <span className="min-w-0">{item.name}</span>
                  </h4>
                  {!item.variants?.length && (
                    <p className="text-[12px] font-black text-[#c45c26] mt-0.5">{formatMoney(currencySymbol, item.price)}</p>
                  )}
                  <VariantPills
                    item={item}
                    symbol={currencySymbol}
                    className="mt-1 text-[9px] bg-[#3d2a1a] text-white px-1.5 py-0.5"
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
