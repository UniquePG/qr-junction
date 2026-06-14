import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CustomerMenuView from './CustomerMenuView';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ table?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parseInt(id, 10) },
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
  const { table } = await searchParams;

  const restaurantId = parseInt(id, 10);
  if (isNaN(restaurantId)) {
    notFound();
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
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

  // Serialize to plain JSON objects to prevent Next.js from throwing errors about passing Prisma Decimal/Date objects to Client Components
  const serializedRestaurant = JSON.parse(JSON.stringify(restaurant));
  const serializedMenu = JSON.parse(JSON.stringify(menu));

  return (
    <CustomerMenuView 
      restaurant={serializedRestaurant} 
      menu={serializedMenu}
      tableNumber={table || null} 
    />
  );
}
