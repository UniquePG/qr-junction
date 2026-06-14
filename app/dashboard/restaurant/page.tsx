'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RestaurantPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/restaurant/profile');
  }, [router]);

  return null;
}
