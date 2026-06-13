'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  QrCode, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Loader2,
  FolderOpen,
  User as UserIcon,
  Layout
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Protected route guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out.');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to log out.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: FolderOpen },
    { name: 'Landing Pages', href: '/dashboard/pages', icon: Layout },
    { name: 'My QR Codes', href: '/dashboard/qrs', icon: QrCode },
    { name: 'Collected Leads', href: '/dashboard/leads', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-30 shrink-0 backdrop-blur-md fixed left-0 top-0 bottom-0 h-screen shadow-xs">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-sans tracking-wide">
            <Image
            src="/NewLogo/Logo.png"
            alt="QR Junction"
            width={160}
            height={42}
            className="h-14 w-auto object-contain"
            priority
          />
          </Link>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-primary text-white shadow-primary' 
                    : 'text-slate-650 hover:text-[#001B50] hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Sign Out */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <Link href="/dashboard/profile" className="flex items-center gap-3 mb-4 px-2 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group no-underline">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Avatar'} 
                className="w-10 h-10 rounded-full border border-slate-200 group-hover:border-primary transition-colors"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-primary font-bold group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#001B50] truncate group-hover:text-primary transition-colors">{user.displayName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-650 hover:text-red-650 text-sm font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 md:pl-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 backdrop-blur-sm shadow-xs">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1 rounded-lg text-slate-650 hover:text-[#001B50] hover:bg-slate-50"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-[#001B50]">
              {pathname === '/dashboard' 
                ? 'Overview' 
                : pathname.includes('/campaigns') 
                  ? 'Campaigns' 
                  : pathname.includes('/pages') 
                    ? 'Landing Pages' 
                    : pathname.includes('/qrs') 
                      ? 'QR Codes' 
                      : pathname.includes('/leads') 
                        ? 'Collected Leads' 
                        : 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/qrs/new"
              className="gradient-primary hover:opacity-95 text-white font-semibold text-sm py-2 px-4 rounded-xl shadow-primary flex items-center gap-2 cursor-pointer transition-all duration-200 border-none"
            >
              <Plus className="w-4 h-4" />
              <span>Create QR</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Inner Page */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-xs bg-white border-r border-slate-200 text-slate-800 h-full z-10 p-5 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                QR Junction
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-650 hover:text-[#001B50] hover:bg-slate-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary text-white shadow-primary' 
                        : 'text-slate-650 hover:text-[#001B50] hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-slate-200 mt-auto">
              <Link 
                href="/dashboard/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 mb-4 px-2 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group no-underline"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Avatar'} 
                    className="w-10 h-10 rounded-full border border-slate-200 group-hover:border-primary transition-colors"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-primary font-bold group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#001B50] truncate group-hover:text-primary transition-colors">{user.displayName || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-650 hover:text-red-650 text-sm font-medium transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
