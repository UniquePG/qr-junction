import { prisma } from '@/lib/prisma';
import { notFound, permanentRedirect } from 'next/navigation';
import { isMenuTheme } from '@/components/menu/themeCatalog';
import { menuPath } from '@/lib/menu/slug';

/** Legacy /r/<restaurantId> link: forwards to the canonical /menu/<name>/<menuId> URL. The raw ?table= value is dropped. */
export default async function LegacyRestaurantMenuRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ previewTheme?: string }>;
}) {
  const { id } = await params;
  const { previewTheme } = await searchParams;
  const restaurantId = parseInt(id, 10);
  if (isNaN(restaurantId)) notFound();

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { name: true },
  });
  if (!restaurant) notFound();

  const menu =
    (await prisma.menu.findFirst({ where: { restaurantId, isDefault: true }, select: { id: true } })) ??
    (await prisma.menu.findFirst({ where: { restaurantId }, orderBy: { id: 'asc' }, select: { id: true } }));
  if (!menu) notFound();

  const path = menuPath({ name: restaurant.name, menuId: menu.id });
  permanentRedirect(isMenuTheme(previewTheme) ? `${path}?previewTheme=${encodeURIComponent(previewTheme)}` : path);
}
