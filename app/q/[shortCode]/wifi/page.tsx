import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import WifiDetailsClient from '@/components/qr/WifiDetailsClient';

export const dynamic = 'force-dynamic';

export default async function WifiPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { shortCode } = await params;

  // Fetch the QR code from the database
  const qrCode = await prisma.qRCode.findUnique({
    where: { shortCode },
  });

  if (!qrCode || qrCode.status === 'DELETED') {
    notFound();
  }

  const dest = qrCode.destination as any;

  return (
    <WifiDetailsClient
      shortCode={qrCode.shortCode}
      qrCodeId={qrCode.id}
      userId={qrCode.userId}
      ssid={dest.ssid || 'Wi-Fi Network'}
      password={dest.password || ''}
      encryption={dest.encryption || 'WPA'}
    />
  );
}
