import { prisma } from '@/lib/prisma';
import { notFound, permanentRedirect } from 'next/navigation';
import { isMenuTheme } from '@/components/menu/themeCatalog';
import { menuPath } from '@/lib/menu/slug';

/** Legacy /r/<restaurantId>/<menuId> link: forwards to the canonical /menu/<name>/<menuId> URL. The raw ?table= value is dropped. */
export default async function LegacySpecificMenuRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; menuId: string }>;
  searchParams: Promise<{ previewTheme?: string }>;
}) {
  const { id, menuId } = await params;
  const { previewTheme } = await searchParams;
  const restaurantId = parseInt(id, 10);
  const targetMenuId = parseInt(menuId, 10);
  if (isNaN(restaurantId) || isNaN(targetMenuId)) notFound();

  const menu = await prisma.menu.findFirst({
    where: { id: targetMenuId, restaurantId },
    select: { id: true, restaurant: { select: { name: true } } },
  });
  if (!menu) notFound();

  const path = menuPath({ name: menu.restaurant.name, menuId: menu.id });
  permanentRedirect(isMenuTheme(previewTheme) ? `${path}?previewTheme=${encodeURIComponent(previewTheme)}` : path);
}
