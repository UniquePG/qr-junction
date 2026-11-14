import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CustomerMenuView from './CustomerMenuView';
import { Metadata } from 'next';
import { isMenuTheme } from '@/components/menu/themeCatalog';
import { guestRestaurantSelect, toGuestRestaurant } from '@/lib/restaurant/guest';
import { loadGuestLocales } from '@/lib/menu/i18n/guestLocales';
import { resolveGuestOffers } from '@/lib/offers/resolve';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ table?: string; previewTheme?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parseInt(id, 10) },
    select: guestRestaurantSelect,
  });

  if (!restaurant) {
    return {
      title: 'Menu Not Found - QR Junction',
    };
  }

  return {
    title: `${restaurant.name} - Digital Menu`,
    description: restaurant.description || `Browse the live menu for ${restaurant.name}.`,
    openGraph: {
      title: `${restaurant.name} - Live Digital Menu`,
      description: restaurant.description || `Browse the live menu for ${restaurant.name}.`,
      images: restaurant.logoUrl ? [{ url: restaurant.logoUrl }] : [],
    },
  };
}

export default async function RestaurantMenuPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { table, previewTheme } = await searchParams;
  const layoutPreview = isMenuTheme(previewTheme) ? previewTheme : null;

  const restaurantId = parseInt(id, 10);
  if (isNaN(restaurantId)) {
    notFound();
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: guestRestaurantSelect,
  });

  if (!restaurant) {
    notFound();
  }

  // Find default menu
  let menu = await prisma.menu.findFirst({
    where: { restaurantId, isDefault: true },
    include: {
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
    // Fallback to first menu
    menu = await prisma.menu.findFirst({
      where: { restaurantId },
      include: {
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
  }

  if (!menu) {
    notFound(); // No menus created yet
  }

  const locales = await loadGuestLocales(restaurantId);
  const guestRestaurant = await toGuestRestaurant(restaurant);
  const offerItems = menu.categories.flatMap((cat) =>
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
  const serializedMenu = JSON.parse(JSON.stringify(menu));
  const serializedOffers = JSON.parse(JSON.stringify(offers));

  return (
    <CustomerMenuView 
      restaurant={serializedRestaurant} 
      menu={layoutPreview ? { ...serializedMenu, theme: layoutPreview } : serializedMenu}
      tableNumber={table || null}
      layoutPreview={layoutPreview}
      locales={locales}
      offers={serializedOffers}
    />
  );
}
