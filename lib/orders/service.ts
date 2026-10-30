import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderChannel, publishOrder, restaurantChannel } from "@/lib/orders/bus";
import { newCustomerPublicId, newOrderPublicId, newPublicToken } from "@/lib/orders/ids";
import { estimatePrepMinutes, stageWindowMinutes } from "@/lib/orders/eta";
import { quoteLines, type PriceQuote } from "@/lib/orders/pricing";
import { canMoveStatus, type OrderStatus } from "@/lib/orders/status";

const ACTIVE = ["PLACED", "ACCEPTED", "PREPARING", "READY"] as const;

export type OrderLineInput = {
  menuItemId: number;
  variantLabel?: string | null;
  quantity: number;
};

export class OrderError extends Error {
  status: number;
  code: string;
  quote?: PriceQuote;
  constructor(status: number, code: string, message: string, quote?: PriceQuote) {
    super(message);
    this.status = status;
    this.code = code;
    this.quote = quote;
  }
}

const orderInclude = {
  customer: true,
  items: { orderBy: { id: "asc" as const } },
  events: { orderBy: { createdAt: "asc" as const } },
  menu: { select: { id: true, name: true } },
  restaurant: { select: { taxName: true, currency: true } },
} satisfies Prisma.MenuOrderInclude;

type OrderRow = Prisma.MenuOrderGetPayload<{ include: typeof orderInclude }>;

function money(value: Prisma.Decimal | number | string) {
  return Math.round(Number(value) * 100) / 100;
}

export function normalizePhone(raw: string) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  return digits;
}

export function normalizeName(raw: string) {
  return String(raw || "").replace(/\s+/g, " ").trim().slice(0, 60);
}

export function toOrderDto(order: OrderRow, extras?: { publicToken?: boolean; history?: unknown[] }) {
  return {
    publicId: order.publicId,
    status: order.status,
    tableNumber: order.tableNumber,
    menuId: order.menuId,
    menuName: order.menu.name,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    customerPublicId: order.customer.publicId,
    subtotal: money(order.subtotal),
    tax: money(order.tax),
    total: money(order.total),
    currency: order.currency,
    taxName: order.restaurant.taxName,
    rejectReason: order.rejectReason,
    expectedReadyAt: order.expectedReadyAt ? order.expectedReadyAt.toISOString() : null,
    stageDueAt: order.stageDueAt ? order.stageDueAt.toISOString() : null,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    events: order.events.map((event) => ({
      status: event.status,
      note: event.note,
      createdAt: event.createdAt.toISOString(),
    })),
    items: order.items.map((item) => ({
      name: item.name,
      variantLabel: item.variantLabel,
      unitPrice: money(item.unitPrice),
      quantity: item.quantity,
      lineTotal: money(Number(item.unitPrice) * item.quantity),
    })),
    ...(extras?.publicToken ? { publicToken: order.publicToken } : {}),
    ...(extras?.history ? { history: extras.history } : {}),
  };
}

async function placedCount(restaurantId: number) {
  return prisma.menuOrder.count({ where: { restaurantId, status: "PLACED" } });
}

function broadcast(order: OrderRow, type: "order.placed" | "order.updated", count: number) {
  const dto = toOrderDto(order);
  publishOrder(restaurantChannel(order.restaurantId), { type, order: dto, placedCount: count });
  publishOrder(orderChannel(order.publicToken), { type, order: { ...dto, publicToken: order.publicToken } });
}

type Variant = { label?: string; price?: number };

function resolveUnitPrice(item: { price: Prisma.Decimal; variants: Prisma.JsonValue; name: string }, variantLabel: string | null) {
  const variants = Array.isArray(item.variants) ? (item.variants as Variant[]) : [];
  if (variants.length > 0) {
    const match = variants.find((variant) => String(variant.label || "").trim() === variantLabel);
    if (!match || match.price === undefined || Number.isNaN(Number(match.price))) {
      throw new OrderError(400, "VARIANT_REQUIRED", `Choose a size for ${item.name}.`);
    }
    return { unitPrice: Number(match.price), variantLabel: String(match.label).trim() };
  }
  if (variantLabel) {
    throw new OrderError(400, "UNKNOWN_VARIANT", `${item.name} does not have that size.`);
  }
  return { unitPrice: Number(item.price), variantLabel: null as string | null };
}

export async function quoteOrder(input: {
  restaurantId: number;
  menuId: number;
  lines: OrderLineInput[];
}) {
  if (!input.lines.length) throw new OrderError(400, "EMPTY", "Add at least one dish.");
  if (input.lines.length > 40) throw new OrderError(400, "TOO_MANY", "This plate has too many lines.");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId },
    select: { id: true, orderingEnabled: true, taxRate: true, taxName: true, currency: true, prepMinutes: true },
  });
  if (!restaurant) throw new OrderError(404, "NOT_FOUND", "Restaurant not found.");
  if (!restaurant.orderingEnabled) throw new OrderError(403, "ORDERING_OFF", "Ordering is off for this restaurant.");

  const menu = await prisma.menu.findFirst({
    where: { id: input.menuId, restaurantId: restaurant.id },
    select: { id: true },
  });
  if (!menu) throw new OrderError(404, "NOT_FOUND", "Menu not found.");

  const ids = [...new Set(input.lines.map((line) => line.menuItemId))];
  const items = await prisma.menuItem.findMany({
    where: { id: { in: ids }, category: { menuId: menu.id, restaurantId: restaurant.id } },
  });
  const byId = new Map(items.map((item) => [item.id, item]));

  const resolved = input.lines.map((line) => {
    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      throw new OrderError(400, "QUANTITY", "Each dish must be between 1 and 20.");
    }
    const item = byId.get(line.menuItemId);
    if (!item) throw new OrderError(400, "UNKNOWN_ITEM", "A dish on this plate is not on the menu.");
    if (!item.isAvailable) throw new OrderError(409, "UNAVAILABLE", `${item.name} is not available.`);
    const priced = resolveUnitPrice(item, line.variantLabel?.trim() || null);
    return {
      menuItemId: item.id,
      name: item.name,
      variantLabel: priced.variantLabel,
      unitPrice: priced.unitPrice,
      quantity,
    };
  });

  return {
    restaurant,
    menu,
    quote: quoteLines(resolved, Number(restaurant.taxRate), restaurant.taxName, restaurant.currency),
  };
}

async function uniqueCustomerId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const publicId = newCustomerPublicId();
    const existing = await prisma.customer.findUnique({ where: { publicId }, select: { id: true } });
    if (!existing) return publicId;
  }
  throw new OrderError(500, "ID", "Could not assign a customer id.");
}

async function uniqueOrderId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const publicId = newOrderPublicId();
    const existing = await prisma.menuOrder.findUnique({ where: { publicId }, select: { id: true } });
    if (!existing) return publicId;
  }
  throw new OrderError(500, "ID", "Could not assign an order id.");
}

export async function createOrder(input: {
  restaurantId: number;
  menuId: number;
  tableNumber?: string | null;
  customerName: string;
  customerPhone: string;
  idempotencyKey: string;
  lines: OrderLineInput[];
}) {
  const name = normalizeName(input.customerName);
  const phone = normalizePhone(input.customerPhone);
  if (name.length < 1) throw new OrderError(400, "NAME", "Add the name for the kitchen.");
  if (phone.length < 10 || phone.length > 15) throw new OrderError(400, "PHONE", "Add a mobile number with at least 10 digits.");
  const idempotencyKey = String(input.idempotencyKey || "").trim().slice(0, 80);
  if (idempotencyKey.length < 8) throw new OrderError(400, "IDEMPOTENCY", "Missing a send key.");

  const existing = await prisma.menuOrder.findUnique({
    where: { restaurantId_idempotencyKey: { restaurantId: input.restaurantId, idempotencyKey } },
    include: orderInclude,
  });
  if (existing) return { order: toOrderDto(existing, { publicToken: true }), created: false };

  const priced = await quoteOrder(input);
  let tableNumber: string | null = null;
  const requestedTable = String(input.tableNumber || "").trim().slice(0, 40);
  if (requestedTable) {
    const table = await prisma.restaurantTable.findFirst({
      where: { restaurantId: priced.restaurant.id, tableNumber: requestedTable },
      select: { tableNumber: true },
    });
    tableNumber = table?.tableNumber ?? null;
  }

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { phone },
      update: { name },
      create: { phone, name, publicId: await uniqueCustomerId() },
    });
    const queueAhead = await tx.menuOrder.count({
      where: {
        restaurantId: priced.restaurant.id,
        status: { in: ["PLACED", "ACCEPTED", "PREPARING"] },
      },
    });
    const itemCount = priced.quote.lines.reduce((sum, line) => sum + line.quantity, 0);
    const readyAt = new Date(Date.now() + estimatePrepMinutes({
      baseMinutes: priced.restaurant.prepMinutes,
      itemCount,
      queueAhead,
    }) * 60_000);
    const created = await tx.menuOrder.create({
      data: {
        publicId: await uniqueOrderId(),
        publicToken: newPublicToken(),
        idempotencyKey,
        restaurantId: priced.restaurant.id,
        menuId: priced.menu.id,
        customerId: customer.id,
        tableNumber,
        status: "PLACED",
        expectedReadyAt: readyAt,
        stageDueAt: new Date(Date.now() + stageWindowMinutes("PLACED") * 60_000),
        subtotal: new Prisma.Decimal(priced.quote.subtotal),
        tax: new Prisma.Decimal(priced.quote.tax),
        total: new Prisma.Decimal(priced.quote.total),
        currency: priced.quote.currency,
        items: {
          create: priced.quote.lines.map((line) => ({
            menuItemId: line.menuItemId,
            name: line.name,
            variantLabel: line.variantLabel,
            unitPrice: new Prisma.Decimal(line.unitPrice),
            quantity: line.quantity,
          })),
        },
        events: { create: { status: "PLACED" } },
      },
      include: orderInclude,
    });
    return created;
  });

  const count = await placedCount(order.restaurantId);
  broadcast(order, "order.placed", count);
  return { order: toOrderDto(order, { publicToken: true }), created: true };
}

export async function getOrderByToken(token: string) {
  const order = await prisma.menuOrder.findUnique({
    where: { publicToken: token },
    include: orderInclude,
  });
  if (!order) return null;
  return toOrderDto(order, { publicToken: true });
}

async function loadOwned(userId: number, publicId: string) {
  const order = await prisma.menuOrder.findFirst({
    where: { publicId, restaurant: { userId } },
    include: orderInclude,
  });
  return order;
}

export async function listRestaurantOrders(userId: number) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { userId },
    select: { id: true, orderingEnabled: true, prepMinutes: true },
  });
  if (!restaurant) throw new OrderError(404, "NOT_FOUND", "Restaurant not found.");
  const finishedWhere = { restaurantId: restaurant.id, status: { in: ["SERVED", "REJECTED"] as const } };
  const [active, finished, finishedCount] = await Promise.all([
    prisma.menuOrder.findMany({
      where: { restaurantId: restaurant.id, status: { in: ["PLACED", "ACCEPTED", "PREPARING", "READY"] } },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.menuOrder.findMany({
      where: finishedWhere,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.menuOrder.count({ where: finishedWhere }),
  ]);
  return {
    orderingEnabled: restaurant.orderingEnabled,
    prepMinutes: restaurant.prepMinutes,
    placedCount: await placedCount(restaurant.id),
    unpaidCount: await prisma.menuOrder.count({ where: { restaurantId: restaurant.id, status: "SERVED", paidAt: null } }),
    finishedCount,
    orders: [...active, ...finished].map((order) => toOrderDto(order)),
  };
}

const PAYMENT_STATUSES = ["unpaid", "paid", "rejected", "all"] as const;
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

function paymentStatusWhere(status: PaymentStatus): Prisma.MenuOrderWhereInput {
  if (status === "unpaid") return { status: "SERVED", paidAt: null };
  if (status === "paid") return { status: "SERVED", paidAt: { not: null } };
  if (status === "rejected") return { status: "REJECTED" };
  return { status: { in: ["SERVED", "REJECTED"] } };
}

function paymentPlaceWhere(place: string): Prisma.MenuOrderWhereInput | null {
  if (place === "counter") return { OR: [{ tableNumber: null }, { tableNumber: "" }] };
  if (place.startsWith("table:")) {
    const tableNumber = place.slice("table:".length).trim().slice(0, 40);
    return tableNumber ? { tableNumber } : null;
  }
  if (place.startsWith("menu:")) {
    const menuId = Number(place.slice("menu:".length));
    return Number.isInteger(menuId) && menuId > 0 ? { menuId } : null;
  }
  return null;
}

export async function listFinishedOrders(
  userId: number,
  input: { q?: string; from?: string; to?: string; status?: string; place?: string; page?: number; pageSize?: number },
) {
  const restaurant = await prisma.restaurant.findUnique({ where: { userId }, select: { id: true } });
  if (!restaurant) throw new OrderError(404, "NOT_FOUND", "Restaurant not found.");
  const q = String(input.q || "").trim().slice(0, 80);
  const createdAt: Prisma.DateTimeFilter = {};
  const from = parseDay(input.from);
  const to = parseDay(input.to, true);
  if (from) createdAt.gte = from;
  if (to) createdAt.lte = to;
  const status = PAYMENT_STATUSES.includes(input.status as PaymentStatus) ? (input.status as PaymentStatus) : "unpaid";
  const pageSize = Math.min(24, Math.max(1, Math.round(Number(input.pageSize) || 12)));
  const requestedPage = Math.max(1, Math.round(Number(input.page) || 1));
  const shared: Prisma.MenuOrderWhereInput[] = [{ restaurantId: restaurant.id }];
  if (createdAt.gte || createdAt.lte) shared.push({ createdAt });
  const place = paymentPlaceWhere(String(input.place || "").slice(0, 48));
  if (place) shared.push(place);
  if (q) {
    shared.push({
      OR: [
        { publicId: { contains: q, mode: "insensitive" } },
        { tableNumber: { contains: q, mode: "insensitive" } },
        { menu: { name: { contains: q, mode: "insensitive" } } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { publicId: { contains: q, mode: "insensitive" } } },
      ],
    });
  }
  const whereFor = (next: PaymentStatus) => ({ AND: [...shared, paymentStatusWhere(next)] });
  const [unpaid, paid, rejected, all, unpaidSum] = await Promise.all([
    prisma.menuOrder.count({ where: whereFor("unpaid") }),
    prisma.menuOrder.count({ where: whereFor("paid") }),
    prisma.menuOrder.count({ where: whereFor("rejected") }),
    prisma.menuOrder.count({ where: whereFor("all") }),
    prisma.menuOrder.aggregate({ where: whereFor("unpaid"), _sum: { total: true } }),
  ]);
  const total = status === "unpaid" ? unpaid : status === "paid" ? paid : status === "rejected" ? rejected : all;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pages);
  const orders = await prisma.menuOrder.findMany({
    where: whereFor(status),
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  return {
    orders: orders.map((order) => toOrderDto(order)),
    page,
    pageSize,
    total,
    unpaidTotal: money(unpaidSum._sum.total ?? 0),
    counts: { unpaid, paid, rejected, all },
  };
}

export async function getRestaurantOrder(userId: number, publicId: string) {
  const order = await loadOwned(userId, publicId);
  if (!order) throw new OrderError(404, "NOT_FOUND", "Order not found.");
  const history = await prisma.menuOrder.findMany({
    where: {
      restaurantId: order.restaurantId,
      customerId: order.customerId,
      id: { not: order.id },
    },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return toOrderDto(order, { history: history.map((row) => toOrderDto(row)) });
}

export async function transitionOrder(userId: number, publicId: string, next: OrderStatus, reason?: string) {
  const order = await loadOwned(userId, publicId);
  if (!order) throw new OrderError(404, "NOT_FOUND", "Order not found.");
  if (!canMoveStatus(order.status, next)) {
    return { order: toOrderDto(order), changed: false };
  }
  const note = next === "REJECTED" ? normalizeName(reason || "").slice(0, 160) || null : null;
  const prep = await prisma.restaurant.findUnique({
    where: { id: order.restaurantId },
    select: { prepMinutes: true },
  });
  const terminal = next === "SERVED" || next === "REJECTED";
  const updated = await prisma.menuOrder.update({
    where: { id: order.id },
    data: {
      status: next,
      rejectReason: next === "REJECTED" ? note : order.rejectReason,
      stageDueAt: terminal ? null : new Date(Date.now() + stageWindowMinutes(next, prep?.prepMinutes ?? 12) * 60_000),
      events: { create: { status: next, note } },
    },
    include: orderInclude,
  });
  const count = await placedCount(updated.restaurantId);
  broadcast(updated, "order.updated", count);
  return { order: toOrderDto(updated), changed: true };
}

function parseDay(value: string | undefined, end = false) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  if (end) date.setHours(23, 59, 59, 999);
  return date;
}

function readyMinutes(raw: number) {
  const minutes = Math.round(Number(raw));
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
    throw new OrderError(400, "ETA", "Ready time must be between 1 and 180 minutes.");
  }
  return minutes;
}

export async function setOrderReadyIn(userId: number, publicId: string, minutes: number) {
  const order = await loadOwned(userId, publicId);
  if (!order) throw new OrderError(404, "NOT_FOUND", "Order not found.");
  if (order.status === "SERVED" || order.status === "REJECTED") {
    return { order: toOrderDto(order), changed: false };
  }
  const updated = await prisma.menuOrder.update({
    where: { id: order.id },
    data: { expectedReadyAt: new Date(Date.now() + readyMinutes(minutes) * 60_000) },
    include: orderInclude,
  });
  broadcast(updated, "order.updated", await placedCount(updated.restaurantId));
  return { order: toOrderDto(updated), changed: true };
}

export async function setOrderStageDue(userId: number, publicId: string, minutes: number) {
  const order = await loadOwned(userId, publicId);
  if (!order) throw new OrderError(404, "NOT_FOUND", "Order not found.");
  if (order.status === "SERVED" || order.status === "REJECTED") {
    return { order: toOrderDto(order), changed: false };
  }
  const updated = await prisma.menuOrder.update({
    where: { id: order.id },
    data: { stageDueAt: new Date(Date.now() + readyMinutes(minutes) * 60_000) },
    include: orderInclude,
  });
  broadcast(updated, "order.updated", await placedCount(updated.restaurantId));
  return { order: toOrderDto(updated), changed: true };
}

export async function setOrderPaid(userId: number, publicId: string, paid: boolean) {
  const order = await loadOwned(userId, publicId);
  if (!order) throw new OrderError(404, "NOT_FOUND", "Order not found.");
  if (order.status !== "SERVED") {
    throw new OrderError(400, "PAYMENT", "Mark payment after the plate is served.");
  }
  const updated = await prisma.menuOrder.update({
    where: { id: order.id },
    data: { paidAt: paid ? new Date() : null },
    include: orderInclude,
  });
  broadcast(updated, "order.updated", await placedCount(updated.restaurantId));
  return { order: toOrderDto(updated), changed: true };
}

export async function setPrepMinutes(userId: number, minutes: number) {
  const next = Math.round(Number(minutes));
  if (!Number.isFinite(next) || next < 5 || next > 90) {
    throw new OrderError(400, "ETA", "Usual kitchen time must be between 5 and 90 minutes.");
  }
  const restaurant = await prisma.restaurant.findUnique({ where: { userId }, select: { id: true } });
  if (!restaurant) throw new OrderError(404, "NOT_FOUND", "Restaurant not found.");
  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { prepMinutes: next },
    select: { prepMinutes: true },
  });
  return updated;
}

export function isActiveStatus(status: string) {
  return (ACTIVE as readonly string[]).includes(status);
}
