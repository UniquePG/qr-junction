import { prisma } from "@/lib/prisma";
import { isDigitalBillEffective } from "@/lib/restaurant/digitalBill";
import type { BillOrder, BillRestaurant } from "@/lib/orders/bill";
import { OrderError } from "@/lib/orders/service";

const restaurantSelect = {
  userId: true,
  settings: true,
  name: true,
  phone: true,
  email: true,
  logoUrl: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  pincode: true,
  country: true,
  gstin: true,
  fssai: true,
  taxName: true,
  taxRate: true,
  currency: true,
} as const;

function money(value: unknown) {
  return Math.round(Number(value) * 100) / 100;
}

function toBillRestaurant(row: {
  name: string;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  gstin: string | null;
  fssai: string | null;
  taxName: string;
  taxRate: unknown;
  currency: string;
}): BillRestaurant {
  return {
    name: row.name,
    phone: row.phone,
    email: row.email,
    logoUrl: row.logoUrl,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    country: row.country,
    gstin: row.gstin,
    fssai: row.fssai,
    taxName: row.taxName,
    taxRate: Number(row.taxRate) || 0,
    currency: row.currency,
  };
}

function toBillOrder(order: {
  publicId: string;
  tableNumber: string | null;
  customer: { name: string };
  subtotal: unknown;
  tax: unknown;
  total: unknown;
  currency: string;
  paidAt: Date | null;
  createdAt: Date;
  restaurant: { taxName: string };
  items: Array<{
    name: string;
    variantLabel: string | null;
    unitPrice: unknown;
    quantity: number;
  }>;
}): BillOrder {
  return {
    publicId: order.publicId,
    tableNumber: order.tableNumber,
    customerName: order.customer.name,
    subtotal: money(order.subtotal),
    tax: money(order.tax),
    total: money(order.total),
    currency: order.currency,
    taxName: order.restaurant.taxName,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      name: item.name,
      variantLabel: item.variantLabel,
      unitPrice: money(item.unitPrice),
      quantity: item.quantity,
      lineTotal: money(Number(item.unitPrice) * item.quantity),
    })),
  };
}

export async function loadStaffBill(userId: number, publicId: string) {
  const order = await prisma.menuOrder.findFirst({
    where: { publicId, restaurant: { userId } },
    include: {
      customer: { select: { name: true } },
      items: { orderBy: { id: "asc" } },
      restaurant: { select: restaurantSelect },
    },
  });
  if (!order) throw new OrderError(404, "NOT_FOUND", "Order not found.");
  const effective = await isDigitalBillEffective(order.restaurant.userId, order.restaurant.settings);
  if (!effective) {
    throw new OrderError(403, "BILL_OFF", "Digital bills are off for this restaurant.");
  }
  return {
    restaurant: toBillRestaurant(order.restaurant),
    order: toBillOrder(order),
  };
}

export async function loadGuestBill(publicId: string, token: string) {
  const order = await prisma.menuOrder.findFirst({
    where: { publicId, publicToken: token },
    include: {
      customer: { select: { name: true } },
      items: { orderBy: { id: "asc" } },
      restaurant: { select: restaurantSelect },
    },
  });
  if (!order) throw new OrderError(404, "NOT_FOUND", "Order not found.");
  if (!order.paidAt) {
    throw new OrderError(403, "UNPAID", "Bill is available after the plate is marked paid.");
  }
  const effective = await isDigitalBillEffective(order.restaurant.userId, order.restaurant.settings);
  if (!effective) {
    throw new OrderError(403, "BILL_OFF", "Digital bills are off for this restaurant.");
  }
  return {
    restaurant: toBillRestaurant(order.restaurant),
    order: toBillOrder(order),
  };
}
