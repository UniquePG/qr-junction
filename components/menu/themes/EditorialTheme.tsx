import { DietMark, VariantPills, formatMoney } from "../shared";
import type { ThemeViewProps } from "../types";

export default function EditorialTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  const hero =
    categories.flatMap((cat) => cat.items).find((item) => item.isPopular) ||
    categories[0]?.items[0] ||
    null;

  return (
    <div className="space-y-10 overflow-x-clip">
      {hero && (
        <button
          type="button"
          onClick={() => onSelectItem(hero)}
          className="w-full text-left bg-[#faf6ee] border border-[#d8cfc0] overflow-hidden"
        >
          <div className="relative h-56 sm:h-72 bg-[#e7dfd0]">
            {hero.image ? (
              <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#d8cfc0]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2b241c]/80 via-[#2b241c]/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-[#faf6ee]">
              <p className="text-[10px] uppercase tracking-[0.28em] mb-1">Cover story</p>
              <h3 className="font-serif text-2xl sm:text-3xl leading-tight wrap-anywhere">{hero.name}</h3>
              <p className="mt-2 text-sm font-semibold">{formatMoney(currencySymbol, hero.variants?.[0]?.price ?? hero.price)}</p>
            </div>
          </div>
        </button>
      )}

      {categories.map((cat) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 space-y-4">
          <div className="border-y border-[#2b241c] py-2">
            <h3 className="font-serif text-xl sm:text-2xl tracking-tight wrap-anywhere">{cat.name}</h3>
          </div>
          <div className="divide-y divide-[#d8cfc0]">
            {cat.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item)}
                className="w-full text-left py-4 flex gap-3 min-w-0 bg-transparent border-none cursor-pointer"
              >
                {item.image && (
                  <img src={item.image} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-serif text-base sm:text-lg leading-snug wrap-anywhere flex items-center gap-2">
                      <DietMark item={item} />
                      {item.name}
                    </h4>
                    {!item.variants?.length && (
                      <span className="font-serif font-bold shrink-0">{formatMoney(currencySymbol, item.price)}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-1 text-xs leading-relaxed text-[#6d6356] line-clamp-2">{item.description}</p>
                  )}
                  <VariantPills
                    item={item}
                    symbol={currencySymbol}
                    className="mt-2 text-[10px] border border-[#2b241c] px-2 py-0.5"
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
