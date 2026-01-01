'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Hook to track page views automatically
 * Usage: Add <PageViewTracker /> to your page component
 */
export function usePageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);
}

/**
 * Component to track page views
 * Add this to pages that need automatic page view tracking
 */
export function PageViewTracker() {
  usePageView();
  return null;
}

