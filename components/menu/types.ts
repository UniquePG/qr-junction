export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: any;
  variants?: { label: string; price: number }[] | null;
  image: string | null;
  isAvailable: boolean;
  isVeg: boolean;
  isNonVeg: boolean;
  isVegan: boolean;
  isPopular: boolean;
};

export type MenuCategory = {
  id: number;
  name: string;
  items: MenuItem[];
};

export type ThemeViewProps = {
  categories: MenuCategory[];
  currencySymbol: string;
  onSelectItem: (item: MenuItem) => void;
};

export type ThemeGroup = "classic" | "new" | "paper" | "night" | "playful";

export type MenuThemeMeta = {
  id: string;
  name: string;
  group: ThemeGroup;
  desc: string;
  vibe: string;
};
