'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  QrCode,
  Users,
  LogOut,
  Menu,
  X,
  Plus,
  FolderOpen,
  User as UserIcon,
  Layout,
  Star,
  Utensils,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from 'next/image';

const navLinks = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserIcon },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: FolderOpen },
  { name: 'Landing Pages', href: '/dashboard/pages', icon: Layout },
  { name: 'My QR Codes', href: '/dashboard/qrs', icon: QrCode },
  { name: 'Collected Leads', href: '/dashboard/leads', icon: Users },
];

const suites = [
  {
    name: 'Review QR',
    href: '/dashboard/reviews',
    detail: 'Ratings, inbox, and insights',
    icon: Star,
  },
  {
    name: 'Restaurant QR',
    href: '/dashboard/restaurant',
    detail: 'Menus, tables, and scans',
    icon: Utensils,
  },
];

function pageTitle(pathname: string) {
  if (pathname === '/dashboard') return 'Overview';
  if (pathname.includes('/profile')) return 'My Profile';
  if (pathname.includes('/campaigns')) return 'Campaigns';
  if (pathname.includes('/pages')) return 'Landing Pages';
  if (pathname.includes('/qrs')) return 'QR Codes';
  if (pathname.includes('/leads')) return 'Collected Leads';
  return 'Dashboard';
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out.');
    } catch {
      toast.error('Failed to log out.');
    }
  };

  const linkClass = (href: string) => {
    const isActive = href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-primary text-white shadow-primary'
        : 'text-slate-650 hover:text-[#001B50] hover:bg-slate-50'
    }`;
  };

  const nav = (onNavigate?: () => void) => (
    <>
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = link.href === '/dashboard' ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link key={link.name} href={link.href} onClick={onNavigate} className={linkClass(link.href)}>
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
            <span>{link.name}</span>
          </Link>
        );
      })}
      <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Suites</p>
      {suites.map((suite) => {
        const Icon = suite.icon;
        return (
          <Link
            key={suite.href}
            href={suite.href}
            onClick={onNavigate}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white no-underline"
          >
            <Icon className="w-5 h-5 text-primary" />
            <span>
              <span className="block text-sm font-semibold text-[#001B50]">{suite.name}</span>
              <span className="block text-[11px] text-slate-500">{suite.detail}</span>
            </span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="h-dvh bg-slate-50 text-slate-800 flex relative overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-30 shrink-0 fixed left-0 top-0 bottom-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/dashboard">
            <Image src="/NewLogo/Logo.png" alt="QR Junction" width={120} height={40} className="h-12 w-auto object-contain" priority />
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">{nav()}</nav>
        <div className="p-4 border-t border-slate-200">
          <Link href="/dashboard/profile" className="block mb-3 no-underline">
            <p className="text-sm font-semibold text-[#001B50] truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-red-50 text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 md:pl-64">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1 bg-transparent border-none cursor-pointer">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-[#001B50]">{pageTitle(pathname)}</h1>
          </div>
          <Link href="/dashboard/qrs/new" className="gradient-primary text-white font-semibold text-sm py-2 px-4 rounded-xl flex items-center gap-2 no-underline">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create QR</span>
          </Link>
        </header>
        <main className="flex-1 min-h-0 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-72 bg-white h-full z-10 p-5">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-[#001B50]">QR Junction</span>
              <button onClick={() => setMobileMenuOpen(false)} className="bg-transparent border-none cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1.5 overflow-y-auto">{nav(() => setMobileMenuOpen(false))}</nav>
          </div>
        </div>
      )}
    </div>
  );
}
