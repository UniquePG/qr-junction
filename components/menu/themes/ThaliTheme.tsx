import { DietMark, VariantPills, formatMoney } from "../shared";
import type { ThemeViewProps } from "../types";

function BrassFork({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 200" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="thali-fork" x1="18" y1="0" x2="18" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6e08a" />
          <stop offset="0.4" stopColor="#d4a017" />
          <stop offset="1" stopColor="#8b3d12" />
        </linearGradient>
      </defs>
      <path d="M7 8v34c0 8 3.4 12 11 12s11-4 11-12V8" stroke="url(#thali-fork)" strokeWidth="3" strokeLinecap="round" />
      <path d="M7 8v22M13.7 8v30M22.3 8v30M29 8v22" stroke="url(#thali-fork)" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 54v122" stroke="url(#thali-fork)" strokeWidth="5" strokeLinecap="round" />
      <path d="M12 176c6 16 12 16 18 0" stroke="url(#thali-fork)" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function BrassSpoon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 200" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="thali-spoon" x1="18" y1="0" x2="18" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6e08a" />
          <stop offset="0.4" stopColor="#d4a017" />
          <stop offset="1" stopColor="#8b3d12" />
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="26" rx="12" ry="20" fill="#f3e3c0" stroke="url(#thali-spoon)" strokeWidth="3.2" />
      <path d="M18 46v130" stroke="url(#thali-spoon)" strokeWidth="5" strokeLinecap="round" />
      <path d="M12 176c6 16 12 16 18 0" stroke="url(#thali-spoon)" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ThaliTheme({ categories, currencySymbol, onSelectItem }: ThemeViewProps) {
  return (
    <div className="space-y-10 overflow-x-clip">
      {categories.map((cat) => (
        <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28 space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-2 h-px w-16 bg-[#c45c26]" />
            <h3 className="text-xl font-black text-[#8b3d12] wrap-anywhere">{cat.name}</h3>
            <div className="mx-auto mt-2 h-px w-16 bg-[#c45c26]" />
          </div>

          <div className="relative min-w-0 px-7 sm:px-10">
            <BrassFork className="pointer-events-none absolute left-0 top-3 w-8 sm:w-10 h-[12.5rem] sm:h-60" />
            <BrassSpoon className="pointer-events-none absolute right-0 top-3 w-8 sm:w-10 h-[12.5rem] sm:h-60" />

            <div className="min-w-0 rounded-[2rem] border-[3px] border-[#d4a017] bg-[#fff8ee] shadow-[inset_0_0_0_6px_#f6ead8] px-2.5 py-4 sm:px-4 sm:py-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {cat.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectItem(item)}
                    className="min-w-0 text-left bg-transparent border-none p-1 cursor-pointer"
                  >
                    <div className="mx-auto w-[4.75rem] h-[4.75rem] sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] border-[#d4a017] bg-[#f6ead8] shadow-sm">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#e2c39a]" />
                      )}
                    </div>
                    <div className="mt-3 text-center space-y-1 min-w-0">
                      <h4 className="text-[13px] font-black text-[#3d2414] leading-snug wrap-anywhere flex items-center justify-center gap-1">
                        <DietMark item={item} />
                        <span className="min-w-0">{item.name}</span>
                      </h4>
                      {!item.variants?.length && (
                        <p className="text-sm font-black text-[#c45c26]">{formatMoney(currencySymbol, item.price)}</p>
                      )}
                      <VariantPills
                        item={item}
                        symbol={currencySymbol}
                        className="text-[9px] font-bold bg-[#c45c26] text-white px-1.5 py-0.5 rounded-full"
                      />
                      {item.isPopular && (
                        <p className="text-[9px] uppercase tracking-widest text-[#8b3d12]">House favourite</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>
      ))}
    </div>
  );
}
