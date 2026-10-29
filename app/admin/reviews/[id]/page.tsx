"use client";

import { AdminCard, AdminLink, AdminLoading, AdminTable } from "@/components/admin/AdminUI";
import { adminService } from "@/lib/api";
import { formatDateTime } from "@/lib/adminClient";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService.review(params.id).then(setData).catch(() => setError("Review campaign not found."));
  }, [params.id]);

  if (error) return <p className="text-sm text-slate-500">{error}</p>;
  if (!data?.review) return <AdminLoading />;
  const review = data.review;

  return (
    <div className="space-y-6">
      <div>
        <AdminLink href="/admin/reviews">Back to reviews</AdminLink>
        <h1 className="text-2xl font-black text-[#001B50] mt-2">{review.name}</h1>
        <p className="text-sm text-slate-500">
          {review.responseCount} responses · avg {review.averageRating.toFixed(1)} · Owner{" "}
          <AdminLink href={`/admin/users/${review.owner.id}`}>{review.owner.email}</AdminLink>
        </p>
      </div>
      <AdminCard title="Ratings">
        <p className="text-sm text-slate-600">
          {review.histogram.map((item: any) => `${item.rating}★ ${item.count}`).join(" · ")}
        </p>
      </AdminCard>
      <AdminCard title="Breakdown">
        <p className="text-sm text-slate-600">Sentiment: {JSON.stringify(review.sentiments)}</p>
        <p className="text-sm text-slate-600 mt-1">Urgency: {JSON.stringify(review.urgencies)}</p>
        <p className="text-sm text-slate-600 mt-1">Category: {JSON.stringify(review.categories)}</p>
      </AdminCard>
      <AdminCard title="Responses">
        <AdminTable headers={["When", "Rating", "Sentiment", "Feedback"]}>
          {review.responses.map((item: any) => (
            <tr key={item.id}>
              <td className="py-2 pr-4 text-xs">{formatDateTime(item.createdAt)}</td>
              <td className="py-2 pr-4">{item.rating}</td>
              <td className="py-2 pr-4 text-xs">{item.sentiment || "—"}</td>
              <td className="py-2 pr-4 text-xs max-w-md">{item.feedback || "—"}</td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}
