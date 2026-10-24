import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { redactDestination } from "@/lib/adminQuery";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();

  const { id } = await params;
  const qrId = Number(id);
  if (!qrId) return NextResponse.json({ error: "Invalid QR id." }, { status: 400 });

  const qr = await prisma.qRCode.findUnique({
    where: { id: qrId },
    include: {
      user: { select: { id: true, email: true, name: true } },
      campaign: { select: { id: true, name: true } },
      landingPage: { select: { id: true, title: true, slug: true } },
      restaurant: { select: { id: true, name: true } },
      restaurantTable: { select: { id: true, tableNumber: true } },
      _count: { select: { scans: true, leads: true, conversions: true, reviewResponses: true } },
    },
  });

  if (!qr) return NextResponse.json({ error: "QR code not found." }, { status: 404 });

  const recentScans = await prisma.scan.findMany({
    where: { qrCodeId: qrId },
    orderBy: { scannedAt: "desc" },
    take: 25,
    select: {
      id: true,
      scannedAt: true,
      country: true,
      city: true,
      deviceType: true,
      browser: true,
      os: true,
    },
  });

  return NextResponse.json({
    success: true,
    qr: {
      ...qr,
      destination: redactDestination(qr.destination),
      recentScans,
    },
  });
}
