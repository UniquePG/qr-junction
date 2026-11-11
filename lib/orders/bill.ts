import { formatTableLabel, orderCallCode } from "@/lib/orders/displayId";

export type BillLine = {
  name: string;
  variantLabel: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type BillRestaurant = {
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
  taxRate: number;
  currency: string;
};

export type BillOrder = {
  publicId: string;
  tableNumber: string | null;
  customerName: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  taxName: string;
  paidAt: string | null;
  createdAt: string;
  items: BillLine[];
};

export type BillPayload = {
  title: string;
  callCode: string;
  placeLabel: string;
  humour: string;
  restaurant: BillRestaurant;
  order: BillOrder;
  moneySymbol: string;
};

const HUMOUR = [
  "Thanks for dining with us. Come hungry again soon.",
  "Good food, good company, and a bill that adds up nicely.",
  "Hope the meal hit the spot. We saved you a seat next time.",
  "Paid and sorted. Now go tell someone about the food.",
  "Hunger handled. See you for round two.",
  "Thanks for stopping by. The kitchen loved cooking for you.",
  "Meal done, bill done. Cravings may return without notice.",
  "Glad you joined us. Next time, bring an emptier stomach.",
];

function pickHumour(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return HUMOUR[hash % HUMOUR.length];
}

export function moneySymbol(currency: string) {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "₹";
}

export function formatBillMoney(symbol: string, value: number) {
  return `${symbol}${Number(value).toFixed(2)}`;
}

export function formatBillAddress(restaurant: BillRestaurant) {
  return [
    restaurant.addressLine1,
    restaurant.addressLine2,
    [restaurant.city, restaurant.state].filter(Boolean).join(", "),
    [restaurant.pincode, restaurant.country].filter(Boolean).join(" "),
  ]
    .map((part) => (part || "").trim())
    .filter(Boolean);
}

export function buildBillPayload(restaurant: BillRestaurant, order: BillOrder): BillPayload {
  const hasTaxId = Boolean(restaurant.gstin?.trim());
  return {
    title: hasTaxId ? "Tax Invoice" : "Bill Receipt",
    callCode: orderCallCode(order.publicId, order.tableNumber),
    placeLabel: formatTableLabel(order.tableNumber),
    humour: pickHumour(order.publicId),
    restaurant,
    order,
    moneySymbol: moneySymbol(order.currency || restaurant.currency),
  };
}
