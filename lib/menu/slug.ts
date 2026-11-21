/** Client-safe helpers for the public menu URL: /menu/<restaurant-name>/<menuId>?table=<code> */

export function slugifyRestaurantName(name: string | null | undefined): string {
  const slug = String(name ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return slug || 'restaurant';
}

export function menuPath(input: { name: string | null | undefined; menuId: number | string; tableCode?: string | null }): string {
  const base = `/menu/${slugifyRestaurantName(input.name)}/${input.menuId}`;
  return input.tableCode ? `${base}?table=${encodeURIComponent(input.tableCode)}` : base;
}
