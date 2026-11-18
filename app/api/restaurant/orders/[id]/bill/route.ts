import { NextResponse } from "next/server";
import { buildBillPdfBytes } from "@/lib/orders/bill-pdf";
import { loadStaffBill } from "@/lib/orders/bill-load";
import { OrderError } from "@/lib/orders/service";
import { auditFromContext, clientIp } from "@/lib/restaurant/audit";
import { restaurantAuth, restaurantErrorResponse } from "@/lib/restaurant/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = await restaurantAuth(request, "orders.bill");
  if (auth.error) return auth.error;
  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") || "pdf";

  try {
    const { restaurant, order } = await loadStaffBill(auth.ctx.restaurant.id, id);
    auditFromContext(auth.ctx, {
      action: format === "json" ? "order.bill_view" : "order.bill_download",
      resourceType: "menu_order",
      resourceId: id,
      summary: format === "json" ? `Viewed bill for order ${id}` : `Downloaded bill for order ${id}`,
      ip: clientIp(request),
    });
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
    return restaurantErrorResponse(error, "Could not build this bill.");
  }
}
