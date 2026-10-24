import { DietMark, VariantPills, formatMoney } from "../shared";
import type { ThemeViewProps } from "../types";

export default function LanternTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="space-y-10 overflow-x-clip">
      {categories.map((cat) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-2 h-px w-20 bg-[#f3c97a]/50" />
            <h3 className="text-lg font-black text-[#f3c97a] wrap-anywhere">{cat.name}</h3>
            <div className="mx-auto mt-2 h-px w-20 bg-[#f3c97a]/50" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {cat.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item)}
                className="min-w-0 text-left bg-transparent border-none cursor-pointer"
              >
                <div className="relative mx-auto w-8 h-3 bg-[#f3c97a]/80 rounded-t-full" />
                <div className="rounded-b-[1.8rem] rounded-t-md bg-[#8b1e24] border border-[#f3c97a]/40 px-2.5 pt-3 pb-4 text-center min-w-0">
                  <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#f3c97a]/70 bg-[#5c1216]">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#6d171c]" />
                    )}
                  </div>
                  <h4 className="mt-2 text-[12px] font-black text-[#fff4d6] leading-snug wrap-anywhere flex items-center justify-center gap-1">
                    <DietMark item={item} />
                    <span className="min-w-0">{item.name}</span>
                  </h4>
                  {!item.variants?.length && (
                    <p className="mt-1 text-sm font-black text-[#f3c97a]">{formatMoney(currencySymbol, item.price)}</p>
                  )}
                  <VariantPills
                    item={item}
                    symbol={currencySymbol}
                    className="mt-1 text-[9px] bg-[#f3c97a] text-[#3a1012] px-1.5 py-0.5 rounded-full"
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
