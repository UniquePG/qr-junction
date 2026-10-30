'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { needsEmailVerification } from '@/lib/emailVerification';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { dashboardService } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      dashboardService.devIp()
        .then((res) => res.json())
        .then((data) => {
          if (data.ip) {
            (window as any).__DEV_IP__ = data.ip;
          }
        })
        .catch((err) => console.error('Failed to fetch dev IP:', err));
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (needsEmailVerification(user)) {
      router.push('/verify-email');
    }
  }, [user, loading, router]);

  if (loading || !user || needsEmailVerification(user)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return children;
}
