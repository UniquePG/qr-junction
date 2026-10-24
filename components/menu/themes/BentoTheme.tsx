import { DietMark, VariantPills, formatMoney } from "../shared";
import type { MenuItem, ThemeViewProps } from "../types";

function Cell({
  item,
  currencySymbol,
  onSelectItem,
  featured,
}: {
  item: MenuItem;
  currencySymbol: string;
  onSelectItem: (item: MenuItem) => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelectItem(item)}
      className={`min-w-0 text-left bg-[#fffaf1] border border-[#2b2118] cursor-pointer p-2.5 ${
        featured ? "col-span-2 flex gap-3 items-center" : ""
      }`}
    >
      <div
        className={`overflow-hidden bg-[#e8dcc6] shrink-0 ${
          featured ? "w-20 h-20 sm:w-24 sm:h-24" : "w-full h-20"
        }`}
      >
        {item.image ? (
          <img src={item.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#d7c7aa]" />
        )}
      </div>
      <div className={`min-w-0 space-y-1 ${featured ? "" : "mt-2"}`}>
        <h4 className="text-[13px] font-black text-[#2b2118] leading-snug wrap-anywhere flex items-center gap-1">
          <DietMark item={item} />
          <span className="min-w-0">{item.name}</span>
        </h4>
        {!item.variants?.length && (
          <p className="text-sm font-black text-[#b42318]">{formatMoney(currencySymbol, item.price)}</p>
        )}
        <VariantPills
          item={item}
          symbol={currencySymbol}
          className="text-[9px] bg-[#2b2118] text-[#fffaf1] px-1.5 py-0.5"
        />
        {item.isPopular && <p className="text-[9px] uppercase tracking-widest text-[#b42318]">Chef pick</p>}
      </div>
    </button>
  );
}

export default function BentoTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="space-y-8 overflow-x-clip">
      {categories.map((cat) => {
        const [hero, ...rest] = cat.items;
        return (
          <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 space-y-3">
            <h3 className="text-center text-[11px] font-black uppercase tracking-[0.28em] text-[#2b2118] wrap-anywhere">
              {cat.name}
            </h3>
            <div className="border-4 border-[#2b2118] bg-[#f3efe6] p-1.5 grid grid-cols-2 gap-1.5">
              {hero && (
                <Cell item={hero} currencySymbol={currencySymbol} onSelectItem={onSelectItem} featured />
              )}
              {rest.map((item) => (
                <Cell key={item.id} item={item} currencySymbol={currencySymbol} onSelectItem={onSelectItem} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
