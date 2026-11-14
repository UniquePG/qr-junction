"use client";

import {
  buildBillPayload,
  formatBillAddress,
  formatBillMoney,
  type BillOrder,
  type BillRestaurant,
} from "@/lib/orders/bill";

function whenLabel(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function BillReceiptView({
  restaurant,
  order,
}: {
  restaurant: BillRestaurant;
  order: BillOrder;
}) {
  const bill = buildBillPayload(restaurant, order);
  const address = formatBillAddress(restaurant);

  return (
    <article className="mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl border border-[#E7DDD2] bg-[#FFFCF8] text-[#1C1410] shadow-[0_12px_40px_rgba(28,20,16,0.08)]">
      <div className="border-b border-[#E7DDD2] bg-gradient-to-br from-[#FFF4EC] to-[#FFFCF8] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">{restaurant.name}</h2>
            <div className="mt-2 space-y-0.5 text-xs text-[#6B5A50]">
              {address.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {restaurant.phone ? <p>Phone {restaurant.phone}</p> : null}
              {restaurant.gstin ? <p>GSTIN {restaurant.gstin}</p> : null}
              {restaurant.fssai ? <p>FSSAI {restaurant.fssai}</p> : null}
            </div>
          </div>
          {restaurant.logoUrl ? (
            <img
              src={restaurant.logoUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl border border-[#E7DDD2] bg-white object-contain p-1"
            />
          ) : null}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C4622D]">{bill.title}</p>
            <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-[#1C1410]">{bill.callCode}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm text-[#6B5A50]">
              {bill.placeLabel} · {order.customerName}
            </p>
            <p className="mt-0.5 text-xs text-[#8A7568]">Ordered {whenLabel(order.createdAt)}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-dashed border-[#E7DDD2] pt-3">
          <div className="mb-2 grid grid-cols-[minmax(0,1fr)_2.5rem_4.5rem] gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">
            <span>Item</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Amt</span>
          </div>
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="grid grid-cols-[minmax(0,1fr)_2.5rem_4.5rem] gap-2 text-sm"
              >
                <span className="min-w-0">
                  <span className="font-medium">{item.name}</span>
                  {item.variantLabel ? (
                    <span className="mt-0.5 block text-xs text-[#8A7568]">{item.variantLabel}</span>
                  ) : null}
                </span>
                <span className="text-right text-[#6B5A50]">{item.quantity}</span>
                <span className="text-right font-medium">
                  {formatBillMoney(bill.moneySymbol, item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-[#E7DDD2] pt-3 text-sm">
          <div className="flex justify-between text-[#6B5A50]">
            <span>Subtotal</span>
            <span>{formatBillMoney(bill.moneySymbol, order.subtotal + (order.discount || 0))}</span>
          </div>
          {(order.discount || 0) > 0 ? (
            <div className="flex justify-between text-emerald-700">
              <span>Offers saved</span>
              <span>−{formatBillMoney(bill.moneySymbol, order.discount || 0)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-[#6B5A50]">
            <span>{order.taxName || "Tax"}</span>
            <span>{formatBillMoney(bill.moneySymbol, order.tax)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatBillMoney(bill.moneySymbol, order.total)}</span>
          </div>
          {order.paidAt ? (
            <div className="mt-3 flex justify-end">
              <span className="inline-flex rounded-lg border border-[#C4622D]/40 bg-[#FFF4EC] px-3 py-1.5 text-xs font-semibold text-[#C4622D]">
                PAID · {whenLabel(order.paidAt)}
              </span>
            </div>
          ) : null}
        </div>

        <p className="mt-5 rounded-2xl bg-[#FFF4EC] px-3 py-3 text-center text-xs leading-relaxed text-[#7A4A2A]">
          {bill.humour}
        </p>
        <p className="mt-3 text-center text-[10px] text-[#A89484]">Powered by QR Junction</p>
      </div>
    </article>
  );
}
