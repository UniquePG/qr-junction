export const restaurantKeys = {
  all: ["restaurant"] as const,
  profile: () => [...restaurantKeys.all, "profile"] as const,
  settings: () => [...restaurantKeys.all, "settings"] as const,
  menus: () => [...restaurantKeys.all, "menus"] as const,
  menu: (menuId: number | string | null) => [...restaurantKeys.all, "menu", menuId] as const,
  tables: () => [...restaurantKeys.all, "tables"] as const,
  orders: () => [...restaurantKeys.all, "orders"] as const,
  overview: (start: string, end: string) => [...restaurantKeys.all, "overview", start, end] as const,
  stats: (start: string, end: string) => [...restaurantKeys.all, "stats", start, end] as const,
};
