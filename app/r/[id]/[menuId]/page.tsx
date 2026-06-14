import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CustomerMenuView from '../CustomerMenuView';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string; menuId: string }>;
  searchParams: Promise<{ table?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; menuId: string }> }): Promise<Metadata> {
  const { id, menuId } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parseInt(id, 10) },
  });
  const menu = await prisma.menu.findUnique({
    where: { id: parseInt(menuId, 10) },
  });

  if (!restaurant || !menu) {
    return {
      title: 'Menu Not Found - QR Junction',
    };
  }

  return {
    title: `${restaurant.name} - ${menu.name}`,
    description: menu.description || restaurant.description || `Browse the live menu for ${restaurant.name}.`,
    openGraph: {
      title: `${restaurant.name} - ${menu.name}`,
      description: menu.description || restaurant.description || `Browse the live menu for ${restaurant.name}.`,
      images: restaurant.logoUrl ? [{ url: restaurant.logoUrl }] : [],
    },
  };
}

export default async function SpecificMenuPage({ params, searchParams }: PageProps) {
  const { id, menuId } = await params;
  const { table } = await searchParams;

  const restaurantId = parseInt(id, 10);
  const targetMenuId = parseInt(menuId, 10);
  
  if (isNaN(restaurantId) || isNaN(targetMenuId)) {
    notFound();
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    notFound();
  }

  const menu = await prisma.menu.findFirst({
    where: { 
      id: targetMenuId, 
      restaurantId: restaurantId 
    },
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
    notFound();
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
