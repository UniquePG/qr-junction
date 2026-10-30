import { redirect } from "next/navigation";

export default async function LegacyReviewAnalyticsRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/reviews/campaigns/${id}`);
}
