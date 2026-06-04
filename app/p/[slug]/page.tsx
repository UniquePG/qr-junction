import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PublicLandingPageClient from '@/components/qr/PublicLandingPageClient';

export const dynamic = 'force-dynamic';

export default async function PublicSlugPage({
  params,
  searchParams
}: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // 1. Fetch Landing Page
  const landingPage = await prisma.landingPage.findUnique({
    where: { slug },
  });

  if (!landingPage) {
    notFound();
  }

  // 2. Resolve parameters context passed by redirect /q/[shortCode]
  const qrCodeId = resolvedSearchParams.qrCodeId || null;
  const utmSource = resolvedSearchParams.utm_source || null;
  const utmMedium = resolvedSearchParams.utm_medium || null;
  const utmCampaign = resolvedSearchParams.utm_campaign || null;

  return (
    <PublicLandingPageClient
      landingPage={landingPage}
      qrCodeId={qrCodeId}
      utmSource={utmSource}
      utmMedium={utmMedium}
      utmCampaign={utmCampaign}
    />
  );
}
