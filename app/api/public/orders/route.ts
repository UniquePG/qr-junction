import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { createOrder, getOrderByToken, OrderError, quoteOrder, type OrderLineInput } from "@/lib/orders/service";

export const dynamic = "force-dynamic";

function linesFrom(body: { items?: OrderLineInput[] }): OrderLineInput[] {
  if (!Array.isArray(body.items)) return [];
  return body.items.map((item) => ({
    menuItemId: Number(item.menuItemId),
    variantLabel: item.variantLabel ?? null,
    quantity: Number(item.quantity),
  }));
}

function fail(error: unknown) {
  if (error instanceof OrderError) {
    return NextResponse.json(
      { error: error.message, code: error.code, quote: error.quote ?? null },
      { status: error.status },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Could not send this plate." }, { status: 500 });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() || "";
  if (token.length < 16) {
    return NextResponse.json({ error: "Missing ticket." }, { status: 400 });
  }
  const order = await getOrderByToken(token);
  if (!order) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  return NextResponse.json({ order });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const restaurantId = Number(body.restaurantId);
    const menuId = Number(body.menuId);
    if (!restaurantId || !menuId) {
      return NextResponse.json({ error: "Missing menu." }, { status: 400 });
    }
    const payload = {
      restaurantId,
      menuId,
      tableNumber: body.tableNumber ?? null,
      customerName: String(body.customerName || ""),
      customerPhone: String(body.customerPhone || ""),
      idempotencyKey: String(body.idempotencyKey || ""),
      lines: linesFrom(body),
    };
    if (body.quoteOnly) {
      const priced = await quoteOrder(payload);
      return NextResponse.json({ quote: priced.quote });
    }
    try {
      const result = await createOrder(payload);
      return NextResponse.json(result, { status: result.created ? 201 : 200 });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const result = await createOrder(payload);
        return NextResponse.json(result);
      }
      throw error;
    }
  } catch (error) {
    return fail(error);
  }
}
