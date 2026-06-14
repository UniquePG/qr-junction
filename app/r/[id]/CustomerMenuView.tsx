'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Utensils, 
  X,
  Compass,
  Star,
  Award,
  Flame,
  Leaf,
  Clock,
  Heart
} from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: any; // Decimal type from Prisma
  variants?: { label: string; price: number }[] | null;
  image: string | null;
  isAvailable: boolean;
  isVeg: boolean;
  isNonVeg: boolean;
  isVegan: boolean;
  isPopular: boolean;
}

interface MenuCategory {
  id: number;
  name: string;
  items: MenuItem[];
}

interface Restaurant {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverImage: string | null;
  currency: string;
  taxRate: any; // Decimal type
  taxName: string;
}

interface Menu {
  id: number;
  name: string;
  description: string | null;
  theme: string;
  categories: MenuCategory[];
}

interface CustomerMenuViewProps {
  restaurant: Restaurant;
  menu: Menu;
  tableNumber: string | null;
}

export default function CustomerMenuView({ restaurant, menu, tableNumber }: CustomerMenuViewProps) {
  const [search, setSearch] = useState('');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [popularFilter, setPopularFilter] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const currencySymbol = useMemo(() => {
    switch (restaurant.currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED ';
      default: return '₹';
    }
  }, [restaurant.currency]);

  // Filter items in each category
  const filteredCategories = useMemo(() => {
    return menu.categories.map((cat) => {
      const items = cat.items.filter((item) => {
        if (!item.isAvailable) return false;

        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                              (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
        
        let matchesDiet = true;
        if (dietFilter === 'VEG') {
          matchesDiet = item.isVeg || item.isVegan;
        } else if (dietFilter === 'NON_VEG') {
          matchesDiet = item.isNonVeg;
        }

        const matchesPopular = !popularFilter || item.isPopular;

        return matchesSearch && matchesDiet && matchesPopular;
      });

      return {
        ...cat,
        items
      };
    }).filter(cat => cat.items.length > 0);
  }, [menu.categories, search, dietFilter, popularFilter]);

  const handleCategoryClick = (id: number) => {
    const el = document.getElementById(`cat-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const taxRate = parseFloat(restaurant.taxRate?.toString() || '0');
  const theme = menu.theme || 'modern';

  const isGourmet = theme === 'gourmet';
  const isStreet = theme === 'street';
  const isCafe = theme === 'cafe';
  const isPremium = theme === 'premium';
  const isMinimal = theme === 'minimal';
  const isModern = theme === 'modern';

  // Dynamic Page Styling
  let pageBgClass = 'bg-slate-50 text-slate-800';
  if (isGourmet) pageBgClass = 'bg-[#0c0d10] text-[#eaeaea]';
  else if (isStreet) pageBgClass = 'bg-[#fffdf9] text-slate-800';
  else if (isPremium) pageBgClass = 'bg-[#FCFAF2] text-slate-850';
  else if (isCafe) pageBgClass = 'bg-[#faf6f0] text-slate-850';

  let infoCardClass = 'bg-white border-slate-200/80 shadow-md';
  if (isGourmet) infoCardClass = 'bg-[#13151b] border-amber-900/10 text-white shadow-[0_4px_30px_rgba(0,0,0,0.5)]';
  else if (isStreet) infoCardClass = 'bg-white border-orange-100 text-slate-900 shadow-md';
  else if (isPremium) infoCardClass = 'bg-[#FCFAF2] border-amber-200 p-5 shadow-xs';
  else if (isCafe) infoCardClass = 'bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b]';

  let restaurantTitleClass = 'text-slate-905';
  if (isGourmet) restaurantTitleClass = 'text-amber-500 font-serif font-black';
  else if (isStreet) restaurantTitleClass = 'text-orange-600 font-black';
  else if (isPremium) restaurantTitleClass = 'text-amber-950 font-serif font-black';

  let stickyHeaderClass = 'bg-slate-50/90 border-slate-200/80';
  if (isGourmet) stickyHeaderClass = 'bg-[#0c0d10]/95 border-slate-900/80';
  else if (isStreet) stickyHeaderClass = 'bg-[#fffdf9]/95 border-orange-100/50';
  else if (isPremium) stickyHeaderClass = 'bg-[#FCFAF2]/95 border-amber-200/30';
  else if (isCafe) stickyHeaderClass = 'bg-[#faf6f0]/95 border-slate-900/10';

  let inputClass = 'bg-white border-slate-200 focus:ring-primary/10 focus:border-primary text-slate-800';
  if (isGourmet) inputClass = 'bg-[#13151b] border-slate-800 focus:ring-amber-500/20 focus:border-amber-500 text-white placeholder-slate-600';
  else if (isStreet) inputClass = 'bg-white border-orange-100 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800';
  else if (isPremium) inputClass = 'bg-[#fcfbf7] border-amber-200 focus:ring-amber-500/20 focus:border-amber-700 text-slate-800';
  else if (isCafe) inputClass = 'bg-white border-2 border-slate-900 focus:ring-2 focus:ring-slate-900 text-slate-900';

  let catPillClass = (active: boolean): string => active
    ? 'bg-[#001B50] text-white border-[#001B50]' 
    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
  if (isGourmet) {
    catPillClass = (active: boolean): string => active
      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold' 
      : 'bg-[#13151b] border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white';
  } else if (isStreet) {
    catPillClass = (active: boolean): string => active
      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent' 
      : 'bg-white border-orange-100 text-orange-950 hover:bg-orange-50';
  } else if (isPremium) {
    catPillClass = (active: boolean): string => active
      ? 'bg-amber-850 text-white border-amber-850' 
      : 'bg-[#FCFAF4] border-amber-250 text-amber-900 hover:bg-amber-50/50';
  } else if (isCafe) {
    catPillClass = (active: boolean): string => active
      ? 'bg-slate-950 text-white border-slate-950 shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
      : 'bg-white border-2 border-slate-900 text-slate-950 hover:bg-slate-50';
  }

  let dietPillClass = (type: 'ALL' | 'VEG' | 'NON_VEG', active: boolean): string => {
    if (active) {
      if (type === 'VEG') return 'bg-emerald-600 text-white border-transparent';
      if (type === 'NON_VEG') return 'bg-red-600 text-white border-transparent';
      return 'bg-[#001B50] text-white border-transparent';
    }
    if (type === 'VEG') return 'bg-white border-slate-200 text-emerald-655 hover:bg-emerald-50';
    if (type === 'NON_VEG') return 'bg-white border-slate-200 text-red-655 hover:bg-red-50';
    return 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-100';
  };
  if (isGourmet) {
    dietPillClass = (type: 'ALL' | 'VEG' | 'NON_VEG', active: boolean): string => {
      if (active) {
        if (type === 'VEG') return 'bg-emerald-500 text-slate-950 border-transparent font-bold';
        if (type === 'NON_VEG') return 'bg-red-500 text-slate-950 border-transparent font-bold';
        return 'bg-amber-500 text-slate-950 border-transparent font-bold';
      }
      return 'bg-[#13151b] border-slate-800 text-slate-400 hover:bg-slate-800';
    };
  } else if (isStreet) {
    dietPillClass = (type: 'ALL' | 'VEG' | 'NON_VEG', active: boolean): string => {
      if (active) {
        if (type === 'VEG') return 'bg-emerald-500 text-white border-transparent font-bold';
        if (type === 'NON_VEG') return 'bg-red-550 text-white border-transparent font-bold';
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent font-bold';
      }
      return 'bg-white border border-orange-100 text-orange-950 hover:bg-orange-50';
    };
  } else if (isCafe) {
    dietPillClass = (type: 'ALL' | 'VEG' | 'NON_VEG', active: boolean): string => {
      if (active) {
        return 'bg-slate-950 text-white border-2 border-slate-900';
      }
      return 'bg-white border-2 border-slate-900 text-slate-950 hover:bg-slate-50';
    };
  }

  let bestSellerClass: string = popularFilter 
    ? 'bg-amber-500 text-slate-950 border-transparent font-bold' 
    : 'bg-white border border-slate-200 text-amber-600 hover:bg-amber-50';
  if (isGourmet) {
    bestSellerClass = popularFilter 
      ? 'bg-amber-500 text-slate-950 border-transparent font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
      : 'bg-[#13151b] border border-slate-800 text-amber-500 hover:bg-slate-800';
  } else if (isStreet) {
    bestSellerClass = popularFilter 
      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent font-bold' 
      : 'bg-white border border-orange-100 text-amber-600 hover:bg-amber-50';
  } else if (isCafe) {
    bestSellerClass = popularFilter 
      ? 'bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold' 
      : 'bg-white border-2 border-slate-900 text-amber-600 hover:bg-amber-50';
  }

  // 1. MODERN CARD LAYOUT
  const renderModern = () => (
    <div className="space-y-10">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-5 scroll-mt-28">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{cat.name}</h3>
            <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-full">{cat.items.length} Items</span>
            <div className="flex-1 h-[1px] bg-slate-200/60" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex h-36 cursor-pointer group"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {item.isVeg && (
                        <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </span>
                      )}
                      {item.isNonVeg && (
                        <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                        </span>
                      )}
                      <h4 className="font-extrabold text-slate-900 truncate text-sm sm:text-base group-hover:text-primary transition-colors">{item.name}</h4>
                    </div>
                    {item.description && <p className="text-slate-505 text-xs line-clamp-2 leading-relaxed font-sans">{item.description}</p>}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      {item.variants && item.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.variants.slice(0, 2).map((v: any, vi: number) => (
                            <span key={vi} className="text-[10px] font-extrabold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg whitespace-nowrap">
                              {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                            </span>
                          ))}
                          {item.variants.length > 2 && (
                            <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">+ {item.variants.length - 2} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-base font-extrabold text-slate-950">
                          {currencySymbol}{parseFloat(item.price.toString()).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {item.isPopular && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50/80 text-amber-600 text-[9px] font-black border border-amber-100 uppercase tracking-wider shrink-0">
                        <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" /> Bestseller
                      </span>
                    )}
                  </div>
                </div>

                {item.image && (
                  <div className="w-32 sm:w-36 h-full shrink-0 overflow-hidden relative bg-slate-50">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 2. MINIMAL LIST LAYOUT
  const renderMinimal = () => (
    <div className="space-y-12 max-w-2xl mx-auto">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-6 scroll-mt-28">
          <div className="text-center space-y-1.5">
            <h3 className="text-xl font-bold tracking-widest text-slate-900 uppercase font-serif">{cat.name}</h3>
            <div className="w-12 h-[1px] bg-slate-300 mx-auto" />
          </div>
          
          <div className="space-y-6 divide-y divide-slate-100">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="pt-5 first:pt-0 flex flex-col gap-2 cursor-pointer group"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="font-serif font-black text-slate-900 text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                    {item.isVeg && (
                      <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0 bg-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    {item.isNonVeg && (
                      <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0 bg-white">
                        <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                      </span>
                    )}
                    {item.name}
                  </h4>
                  <div className="flex-1 border-b border-dotted border-slate-300 mx-2" />
                  {!item.variants || item.variants.length === 0 ? (
                    <span className="font-serif font-extrabold text-slate-905 text-base">
                      {currencySymbol}{parseFloat(item.price.toString()).toFixed(0)}
                    </span>
                  ) : null}
                </div>
                
                <div className="flex justify-between items-start gap-6">
                  {item.description && (
                    <p className="text-slate-500 text-xs italic font-sans max-w-xl leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.variants && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end shrink-0">
                      {item.variants.map((v: any, vi: number) => (
                        <span key={vi} className="text-xs font-serif font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded">
                          {v.label}: <span className="font-bold text-slate-950">{currencySymbol}{Number(v.price).toFixed(0)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {item.isPopular && (
                  <div className="text-[9px] text-amber-600 font-extrabold uppercase tracking-widest mt-0.5">
                    ★ chef's recommendation
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 3. PREMIUM RESTAURANT LAYOUT
  const renderPremium = () => (
    <div className="space-y-14 max-w-4xl mx-auto">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-8 scroll-mt-28">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-serif text-amber-900 font-medium italic tracking-wide">{cat.name}</h3>
            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-[1px] bg-amber-305" />
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <div className="w-16 h-[1px] bg-amber-305" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#FCFAF4] border-2 border-double border-amber-200/80 p-5 rounded-3xl shadow-xs hover:border-amber-400 transition-all cursor-pointer flex gap-4"
                onClick={() => setSelectedItem(item)}
              >
                {item.image && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-amber-205 p-1 bg-white shrink-0 shadow-xs relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-black text-amber-950 text-base truncate flex items-center gap-2">
                        {item.isVeg && (
                          <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0 bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {item.isNonVeg && (
                          <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0 bg-white">
                            <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                          </span>
                        )}
                        {item.name}
                      </h4>
                      {!item.variants || item.variants.length === 0 ? (
                        <span className="font-serif text-base font-bold text-amber-800 shrink-0">
                          {currencySymbol}{parseFloat(item.price.toString()).toFixed(0)}
                        </span>
                      ) : null}
                    </div>
                    {item.description && <p className="text-slate-600 text-xs line-clamp-2 mt-1 leading-relaxed font-sans">{item.description}</p>}
                  </div>
                  
                  {item.variants && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.variants.map((v: any, vi: number) => (
                        <span key={vi} className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-100/40 text-[10px]">
                    {item.isPopular && (
                      <span className="text-amber-700 font-extrabold flex items-center gap-0.5">
                        <Award className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> Chef's Choice
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 4. CAFE LAYOUT
  const renderCafe = () => (
    <div className="space-y-10">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-6 scroll-mt-28">
          <h3 className="text-xl font-black bg-slate-900 text-white py-2 px-5 rounded-2xl w-fit border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">{cat.name}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border-2 border-slate-900 p-5 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col justify-between gap-4"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                      {item.isVeg && (
                        <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0 bg-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </span>
                      )}
                      {item.isNonVeg && (
                        <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0 bg-white">
                          <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                        </span>
                      )}
                      {item.name}
                    </h4>
                    {item.description && <p className="text-slate-650 text-xs line-clamp-2 leading-relaxed">{item.description}</p>}
                  </div>
                  {!item.variants || item.variants.length === 0 ? (
                    <span className="bg-amber-400 text-slate-900 font-black px-3 py-1 rounded-xl text-sm border-2 border-slate-900 shrink-0 shadow-[2px_2px_0px_#1e293b]">
                      {currencySymbol}{parseFloat(item.price.toString()).toFixed(0)}
                    </span>
                  ) : null}
                </div>

                {item.variants && item.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.variants.map((v: any, vi: number) => (
                      <span key={vi} className="bg-amber-100 text-slate-900 font-extrabold px-2.5 py-0.5 rounded-lg text-xs border border-slate-900 whitespace-nowrap">
                        {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-dashed border-slate-200">
                  {item.isPopular ? (
                    <span className="text-amber-600 flex items-center gap-0.5 font-black uppercase tracking-wider text-[9px]"><Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Popular</span>
                  ) : (
                    <span className="text-slate-400">Available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 5. GOURMET LUXURY LAYOUT (New Theme 1)
  const renderGourmet = () => (
    <div className="space-y-16">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-8 scroll-mt-28">
          <div className="text-center space-y-2.5">
            <h3 className="text-3xl font-serif text-amber-500 font-medium tracking-widest uppercase">{cat.name}</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-amber-500/50" />
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#12141c] border border-amber-900/30 rounded-3xl p-5 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(217,119,6,0.1)] transition-all duration-300 cursor-pointer flex gap-4 relative overflow-hidden"
                onClick={() => setSelectedItem(item)}
              >
                {item.image && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-amber-950 bg-[#0c0d10] shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover filter brightness-95" />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-black text-amber-100 text-base truncate flex items-center gap-2">
                        {item.isVeg && (
                          <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {item.isNonVeg && (
                          <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                          </span>
                        )}
                        {item.name}
                      </h4>
                      {!item.variants || item.variants.length === 0 ? (
                        <span className="font-serif text-base font-bold text-amber-500 shrink-0">
                          {currencySymbol}{parseFloat(item.price.toString()).toFixed(0)}
                        </span>
                      ) : null}
                    </div>
                    {item.description && <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed font-sans">{item.description}</p>}
                  </div>

                  {item.variants && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.variants.map((v: any, vi: number) => (
                        <span key={vi} className="text-[10px] font-bold text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800 text-[10px]">
                    {item.isPopular ? (
                      <span className="text-amber-500 font-extrabold flex items-center gap-0.5 text-[9px] uppercase tracking-wider">
                        ★ Chef Recommend
                      </span>
                    ) : (
                      <span className="text-slate-500">Available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 6. STREET FOOD LAYOUT (New Theme 2)
  const renderStreet = () => (
    <div className="space-y-12">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-6 scroll-mt-28">
          <div className="flex items-center justify-between border-b border-orange-100 pb-2">
            <h3 className="text-xl font-black text-orange-950 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-650 fill-orange-500" />
              {cat.name}
            </h3>
            <span className="text-xs font-bold text-orange-600 bg-orange-55/70 px-2.5 py-1 rounded-xl">{cat.items.length} items</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl border border-orange-100/50 p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden group"
                onClick={() => setSelectedItem(item)}
              >
                {/* Image Banner */}
                {item.image ? (
                  <div className="h-44 w-full rounded-2xl overflow-hidden relative bg-slate-50 shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {item.isPopular && (
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-0.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                        <Flame className="w-3 h-3 fill-white" /> Popular
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-44 w-full rounded-2xl bg-gradient-to-br from-orange-400/10 to-red-500/10 flex items-center justify-center shrink-0 mb-1">
                    <Utensils className="w-8 h-8 text-orange-400" />
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-black text-slate-900 text-base truncate flex items-center gap-2">
                        {item.isVeg && (
                          <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0 bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {item.isNonVeg && (
                          <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0 bg-white">
                            <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                          </span>
                        )}
                        {item.name}
                      </h4>
                      {!item.variants || item.variants.length === 0 ? (
                        <span className="text-base font-black text-orange-600 shrink-0">
                          {currencySymbol}{parseFloat(item.price.toString()).toFixed(0)}
                        </span>
                      ) : null}
                    </div>
                    {item.description && <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-sans">{item.description}</p>}
                  </div>

                  {item.variants && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.variants.map((v: any, vi: number) => (
                        <span key={vi} className="text-[10px] font-black text-white bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-0.5 rounded-lg whitespace-nowrap shadow-sm">
                          {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-orange-50 text-[10px] font-bold">
                    {item.isVegan ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">🌿 Vegan</span>
                    ) : (
                      <span className="text-slate-400">Available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 relative font-sans ${pageBgClass}`}>
      {/* Cover Banner */}
      <div className="h-44 sm:h-56 w-full bg-slate-200 relative">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10" />
        )}
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Brand Profile Info Card overlay */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <div className={`rounded-3xl border p-5 sm:p-6 transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 ${infoCardClass}`}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo overlay */}
            <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden shrink-0 -mt-16 sm:-mt-12">
              {restaurant.logoUrl ? (
                <img src={restaurant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-405">
                  <Utensils className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <h1 className={`text-2xl tracking-tight leading-tight ${restaurantTitleClass}`}>{restaurant.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${
                  isGourmet 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                    : isStreet 
                      ? 'bg-orange-500/10 text-orange-655 border-orange-500/20' 
                      : 'bg-primary/5 text-primary border border-primary/10'
                }`}>
                  {menu.name}
                </span>
                {menu.description && (
                  <span className={`text-xs truncate max-w-[200px] ${isGourmet ? 'text-slate-400' : 'text-slate-500'}`} title={menu.description}>
                    • {menu.description}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Table Diners Indicator */}
          {tableNumber && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 shrink-0">
              <Compass className="w-4 h-4 animate-spin-slow" />
              Dining at Table {tableNumber}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Filters & Search */}
      <div className={`sticky top-0 backdrop-blur-md border-b z-20 py-3 mt-6 transition-all duration-300 ${stickyHeaderClass}`}>
        <div className="max-w-4xl mx-auto px-4 space-y-3.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search dishes, drinks, appetizers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 transition-all font-sans ${inputClass}`}
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none py-1">
            <div className="flex gap-2">
              <button
                onClick={() => setDietFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none border border-transparent ${
                  dietPillClass('ALL', dietFilter === 'ALL')
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter('VEG')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none flex items-center gap-1.5 border border-transparent ${
                  dietPillClass('VEG', dietFilter === 'VEG')
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                  dietFilter === 'VEG'
                    ? (isGourmet ? 'bg-slate-950' : isCafe ? 'bg-emerald-500' : 'bg-white')
                    : 'bg-emerald-500'
                }`} />
                Veg
              </button>
              <button
                onClick={() => setDietFilter('NON_VEG')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none flex items-center gap-1.5 border border-transparent ${
                  dietPillClass('NON_VEG', dietFilter === 'NON_VEG')
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                  dietFilter === 'NON_VEG'
                    ? (isGourmet ? 'bg-slate-950' : isCafe ? 'bg-red-500' : 'bg-white')
                    : 'bg-red-500'
                }`} />
                Non-Veg
              </button>
            </div>

            <button
              onClick={() => setPopularFilter(!popularFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none flex items-center gap-1 border border-transparent shrink-0 ${
                bestSellerClass
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Bestsellers
            </button>
          </div>

          {/* Sticky horizontal Category slider */}
          {filteredCategories.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pt-1">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer select-none active:scale-95 transition-all border ${
                    catPillClass(false)
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories & Items Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {filteredCategories.length === 0 ? (
          <div className={`text-center py-20 border rounded-3xl p-8 ${
            isGourmet ? 'bg-[#13151b] border-slate-900 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
            <h3 className="font-bold text-lg mb-1">No Items Found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Try modifying your search queries or diet toggles to view available dishes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {theme === 'minimal' && renderMinimal()}
            {theme === 'premium' && renderPremium()}
            {theme === 'cafe' && renderCafe()}
            {theme === 'modern' && renderModern()}
            {theme === 'gourmet' && renderGourmet()}
            {theme === 'street' && renderStreet()}
          </div>
        )}
      </main>

      {/* Tax & Footer Details */}
      <footer className={`border-t py-12 mt-16 text-center text-xs space-y-2 transition-all duration-300 ${
        isGourmet 
          ? 'border-slate-900 bg-[#0c0d10] text-slate-500' 
          : 'border-slate-200 bg-white text-slate-400'
      }`}>
        <p className={`font-black uppercase tracking-widest text-[10px] ${isGourmet ? 'text-amber-500' : 'text-slate-655'}`}>
          {restaurant.name}
        </p>
        <p className={isGourmet ? 'text-slate-400' : 'text-slate-500'}>Currently viewing: {menu.name}</p>
        {taxRate > 0 && (
          <p className={isGourmet ? 'text-slate-400' : 'text-slate-505'}>Subject to local taxes: {restaurant.taxName} of {taxRate}% included or added at checkout.</p>
        )}
        {tableNumber && <p className={`font-bold ${isGourmet ? 'text-slate-300' : 'text-slate-650'}`}>Dining Location: Table {tableNumber}</p>}
        <p className="pt-4 text-slate-350">Powered by QR Junction Menu Suite</p>
      </footer>

      {/* Dish Expanded Dialog Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div 
            className={`rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-up relative max-h-[90vh] flex flex-col transition-all duration-300 ${
              isGourmet ? 'bg-[#13151b] text-white border border-slate-800' : 'bg-white text-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className={`absolute top-4 right-4 z-10 text-white rounded-full p-2 transition-all cursor-pointer border-none shadow-sm ${
                isGourmet ? 'bg-black/60 hover:bg-black/80' : 'bg-black/40 hover:bg-black/60'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Dish Image */}
            {selectedItem.image ? (
              <div className="h-64 w-full bg-slate-100 overflow-hidden relative shrink-0">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`h-28 w-full flex items-center justify-center shrink-0 border-b ${
                isGourmet ? 'bg-[#0c0d10] text-slate-600 border-slate-900' : 'bg-slate-50 text-slate-350 border-slate-100'
              }`}>
                <Utensils className="w-10 h-10" />
              </div>
            )}

            {/* Content info */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-none">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  {selectedItem.isVeg && (
                    <span className="w-4.5 h-4.5 rounded border border-emerald-500 flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </span>
                  )}
                  {selectedItem.isNonVeg && (
                    <span className="w-4.5 h-4.5 rounded border border-red-500 flex items-center justify-center shrink-0">
                      <span className="w-2.5 h-2.5 bg-red-500 rotate-45 transform" />
                    </span>
                  )}
                  <h3 className={`text-xl font-bold tracking-tight ${isGourmet ? 'text-amber-100 font-serif' : 'text-slate-900'}`}>{selectedItem.name}</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedItem.variants && selectedItem.variants.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.variants.map((v: any, vi: number) => (
                        <div key={vi} className={`flex flex-col items-center border rounded-xl px-3 py-2 min-w-[75px] ${
                          isGourmet 
                            ? 'bg-[#191b24] border-slate-800 text-amber-500' 
                            : isStreet 
                              ? 'bg-orange-50/50 border-orange-100 text-orange-950'
                              : 'bg-slate-50 border border-slate-200 text-slate-800'
                        }`}>
                          <span className={`text-[9px] font-semibold uppercase tracking-wider ${isGourmet ? 'text-slate-500' : 'text-slate-400'}`}>{v.label}</span>
                          <span className="text-base font-black">{currencySymbol}{Number(v.price).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-lg font-black ${isGourmet ? 'text-amber-500' : 'text-slate-850'}`}>
                      {currencySymbol}{parseFloat(selectedItem.price.toString()).toFixed(2)}
                    </span>
                  )}
                  {selectedItem.isPopular && (
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 shrink-0">
                      <Sparkles className="w-3 h-3 fill-amber-500" /> Bestseller
                    </span>
                  )}
                </div>
              </div>

              {selectedItem.description && (
                <div className={`space-y-1.5 border-t pt-4 ${isGourmet ? 'border-slate-800' : 'border-slate-100'}`}>
                  <h5 className={`text-xs font-bold uppercase tracking-wider ${isGourmet ? 'text-slate-500' : 'text-slate-405'}`}>Dish Description</h5>
                  <p className={`text-sm leading-relaxed font-sans ${isGourmet ? 'text-slate-300' : 'text-slate-655'}`}>{selectedItem.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
