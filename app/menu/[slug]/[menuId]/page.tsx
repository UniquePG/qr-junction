import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import CustomerMenuView from './CustomerMenuView';
import { Metadata } from 'next';
import { isMenuTheme } from '@/components/menu/themeCatalog';
import { guestRestaurantSelect, toGuestRestaurant } from '@/lib/restaurant/guest';
import { loadGuestLocales } from '@/lib/menu/i18n/guestLocales';
import { resolveGuestOffers } from '@/lib/offers/resolve';
import { menuPath, slugifyRestaurantName } from '@/lib/menu/slug';
import { resolveTableFromCode } from '@/lib/menu/tableCode';

interface PageProps {
  params: Promise<{ slug: string; menuId: string }>;
  searchParams: Promise<{ table?: string; previewTheme?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; menuId: string }> }): Promise<Metadata> {
  const { menuId } = await params;
  const id = Number(menuId);
  const menu = Number.isInteger(id)
    ? await prisma.menu.findUnique({
        where: { id },
        include: { restaurant: { select: guestRestaurantSelect } },
      })
    : null;

  if (!menu) {
    return { title: 'Menu Not Found - QR Junction' };
  }
  const restaurant = menu.restaurant;
  const description = menu.description || restaurant.description || `Browse the live menu for ${restaurant.name}.`;

  return {
    title: `${restaurant.name} - ${menu.name}`,
    description,
    openGraph: {
      title: `${restaurant.name} - ${menu.name}`,
      description,
      images: restaurant.logoUrl ? [{ url: restaurant.logoUrl }] : [],
    },
  };
}

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const { slug, menuId } = await params;
  const { table, previewTheme } = await searchParams;
  const layoutPreview = isMenuTheme(previewTheme) ? previewTheme : null;

  const targetMenuId = Number(menuId);
  if (!Number.isInteger(targetMenuId) || targetMenuId <= 0) {
    notFound();
  }

  const menu = await prisma.menu.findUnique({
    where: { id: targetMenuId },
    include: {
      restaurant: { select: guestRestaurantSelect },
      categories: {
        orderBy: { order: 'asc' },
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!menu) {
    notFound();
  }

  const { restaurant: restaurantRow, ...menuData } = menu;
  const restaurantId = restaurantRow.id;

  // The table code is decrypted server-side; raw table names in the URL are never trusted.
  const resolvedTable = table ? await resolveTableFromCode(table, restaurantId) : null;
  const tableCode = resolvedTable ? table! : null;

  // Table-specific menu: send the guest to the menu assigned to this table.
  const targetMenu = resolvedTable?.menuId && resolvedTable.menuId !== menu.id ? resolvedTable.menuId : menu.id;
  const canonicalSlug = slugifyRestaurantName(restaurantRow.name);

  if (targetMenu !== menu.id || slug !== canonicalSlug) {
    const base = menuPath({ name: restaurantRow.name, menuId: targetMenu, tableCode });
    const extra = layoutPreview ? `${base.includes('?') ? '&' : '?'}previewTheme=${encodeURIComponent(layoutPreview)}` : '';
    redirect(`${base}${extra}`);
  }

  const locales = await loadGuestLocales(restaurantId);
  const guestRestaurant = await toGuestRestaurant(restaurantRow);
  const offerItems = menuData.categories.flatMap((cat) =>
    cat.items.map((item) => ({
      id: item.id,
      categoryId: cat.id,
      price: Number(item.price),
    })),
  );
  const offers = await resolveGuestOffers({
    restaurantId,
    menuId: menu.id,
    items: offerItems,
  });

  // Serialize to plain JSON objects to prevent Next.js from throwing errors about passing Prisma Decimal/Date objects to Client Components
  const serializedRestaurant = JSON.parse(JSON.stringify(guestRestaurant));
  const serializedMenu = JSON.parse(JSON.stringify(menuData));
  const serializedOffers = JSON.parse(JSON.stringify(offers));

  return (
    <CustomerMenuView
      restaurant={serializedRestaurant}
      menu={layoutPreview ? { ...serializedMenu, theme: layoutPreview } : serializedMenu}
      tableNumber={resolvedTable?.tableNumber ?? null}
      tableCode={tableCode}
      layoutPreview={layoutPreview}
      locales={locales}
      offers={serializedOffers}
    />
  );
}
