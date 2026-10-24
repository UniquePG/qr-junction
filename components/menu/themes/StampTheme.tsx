import { DietMark, VariantPills, formatMoney } from "../shared";
import type { ThemeViewProps } from "../types";

export default function StampTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="space-y-10 overflow-x-clip">
      {categories.map((cat) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 space-y-4">
          <div className="flex items-end justify-between gap-2">
            <h3 className="font-serif text-xl text-[#1d3557] wrap-anywhere">{cat.name}</h3>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#c1121f]">Postage</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {cat.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item)}
                className="relative min-w-0 text-left bg-[#fffdf8] p-2 cursor-pointer"
                style={{
                  border: "2px dashed #1d3557",
                }}
              >
                <div className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full border-2 border-[#c1121f]/70 rotate-12" />
                <div className="h-20 bg-[#e9e1d2] overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#d8cfbe]" />
                  )}
                </div>
                <div className="mt-2 min-w-0">
                  <h4 className="text-[12px] font-black text-[#1d3557] leading-snug wrap-anywhere flex items-center gap-1">
                    <DietMark item={item} />
                    <span className="min-w-0">{item.name}</span>
                  </h4>
                  {!item.variants?.length && (
                    <p className="text-[12px] font-black text-[#c1121f] mt-0.5">{formatMoney(currencySymbol, item.price)}</p>
                  )}
                  <VariantPills
                    item={item}
                    symbol={currencySymbol}
                    className="mt-1 text-[9px] border border-[#1d3557] px-1.5 py-0.5"
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
