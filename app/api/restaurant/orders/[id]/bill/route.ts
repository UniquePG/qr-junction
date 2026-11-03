import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { buildBillPdfBytes } from "@/lib/orders/bill-pdf";
import { loadStaffBill } from "@/lib/orders/bill-load";
import { OrderError } from "@/lib/orders/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") || "pdf";

  try {
    const { restaurant, order } = await loadStaffBill(userId, id);
    if (format === "json") {
      return NextResponse.json({ restaurant, order });
    }
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
