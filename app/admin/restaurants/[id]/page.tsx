"use client";

import { AdminCard, AdminLink, AdminLoading, AdminTable } from "@/components/admin/AdminUI";
import { adminService } from "@/lib/api";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminRestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.restaurant(params.id).then(setData).catch(() => setError("Restaurant not found."));
  }, [params.id]);

  if (error) return <p className="text-sm text-slate-500">{error}</p>;
  if (!data?.restaurant) return <AdminLoading />;
  const restaurant = data.restaurant;

  return (
    <div className="space-y-6">
      <div>
        <AdminLink href="/admin/restaurants">Back to restaurants</AdminLink>
        <h1 className="text-2xl font-black text-[#001B50] mt-2">{restaurant.name}</h1>
        <p className="text-sm text-slate-500">
          Owner <AdminLink href={`/admin/users/${restaurant.user.id}`}>{restaurant.user.email}</AdminLink> · {restaurant.scans} scans · {restaurant.currency}
        </p>
        {restaurant.description ? <p className="text-sm text-slate-600 mt-2">{restaurant.description}</p> : null}
      </div>

      <AdminCard title="Table ordering">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            {restaurant.orderingEnabled
              ? "Customers can add dishes and send a plate from this menu."
              : "This restaurant is a digital menu only. Add buttons stay hidden."}
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setSaving(true);
              adminService.setOrdering(params.id, !restaurant.orderingEnabled)
                .then((next) => setData((current: any) => ({
                  ...current,
                  restaurant: { ...current.restaurant, orderingEnabled: next.restaurant.orderingEnabled },
                })))
                .catch(() => setError("Could not update ordering."))
                .finally(() => setSaving(false));
            }}
            className={`h-10 shrink-0 cursor-pointer rounded-xl border-none px-4 text-sm font-semibold text-white ${restaurant.orderingEnabled ? "bg-slate-700" : "bg-[#001B50]"}`}
          >
            {saving ? "Saving…" : restaurant.orderingEnabled ? "Turn ordering off" : "Turn ordering on"}
          </button>
        </div>
      </AdminCard>

      {restaurant.menus.map((menu: any) => (
        <AdminCard key={menu.id} title={`Menu: ${menu.name}`}>
          {menu.categories.map((category: any) => (
            <div key={category.id} className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{category.name}</p>
              <AdminTable headers={["Item", "Price", "Flags"]}>
                {category.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-4">{item.name}</td>
                    <td className="py-2 pr-4">{restaurant.currency} {Number(item.price)}</td>
                    <td className="py-2 pr-4 text-xs">{[item.isVeg && "Veg", item.isPopular && "Popular", !item.isAvailable && "Unavailable"].filter(Boolean).join(", ") || "—"}</td>
                  </tr>
                ))}
              </AdminTable>
            </div>
          ))}
        </AdminCard>
      ))}

      <AdminCard title="Tables">
        <AdminTable headers={["Table", "Menu", "QR", "Scans"]}>
          {restaurant.tables.map((table: any) => (
            <tr key={table.id}>
              <td className="py-2 pr-4">{table.tableNumber}</td>
              <td className="py-2 pr-4">{table.menu?.name || "—"}</td>
              <td className="py-2 pr-4">{table.qrCode ? <AdminLink href={`/admin/qrs/${table.qrCode.id}`}>{table.qrCode.shortCode}</AdminLink> : "—"}</td>
              <td className="py-2 pr-4">{table.qrCode?.totalScans || 0}</td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}
