import { NextResponse } from "next/server";
import { orderChannel } from "@/lib/orders/bus";
import { orderEventStream } from "@/lib/orders/stream";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() || "";
  if (token.length < 16) {
    return NextResponse.json({ error: "Missing ticket." }, { status: 400 });
  }
  const order = await prisma.menuOrder.findUnique({
    where: { publicToken: token },
    select: { id: true },
  });
  if (!order) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  return orderEventStream(orderChannel(token), request.signal);
}
