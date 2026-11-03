import { NextResponse } from "next/server";
import { buildBillPdfBytes } from "@/lib/orders/bill-pdf";
import { loadGuestBill } from "@/lib/orders/bill-load";
import { OrderError } from "@/lib/orders/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ publicId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { publicId } = await params;
  const token = new URL(request.url).searchParams.get("token")?.trim() || "";
  if (token.length < 16) {
    return NextResponse.json({ error: "Missing ticket." }, { status: 400 });
  }

  try {
    const { restaurant, order } = await loadGuestBill(publicId, token);
    const bytes = await buildBillPdfBytes(restaurant, order);
    const filename = `bill-${order.publicId}.pdf`;
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not build this bill." }, { status: 500 });
  }
}
