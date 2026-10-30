'use client';

import React from 'react';
import LandingPageBuilder from '@/components/qr/LandingPageBuilder';

export default function EditLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const pageId = parseInt(id, 10);

  if (isNaN(pageId)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 font-bold">Invalid Landing Page ID.</p>
      </div>
    );
  }

  return <LandingPageBuilder pageId={pageId} />;
}
