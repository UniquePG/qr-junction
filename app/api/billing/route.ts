import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";
import { resolveBilling } from "@/lib/billing/resolve";
import { razorpayConfigured } from "@/lib/billing/razorpay";

export async function GET(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const billing = await resolveBilling(userId);
  const [plans, features] = await Promise.all([
    prisma.plan.findMany({
      where: { scope: "ACCOUNT", isPublic: true, active: true },
      orderBy: { sortOrder: "asc" },
      include: { limits: true },
    }),
    prisma.featureDefinition.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return NextResponse.json({ billing, plans, features, checkout: razorpayConfigured() });
}
