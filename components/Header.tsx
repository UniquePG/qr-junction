'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { Menu, X, QrCode, LayoutDashboard, LogIn } from 'lucide-react';

export default function Header() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'backdrop-blur-md bg-slate-950/80 border-b border-slate-900/60 py-3.5 shadow-lg' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group no-underline">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl text-white group-hover:scale-105 transition-transform duration-200 shadow-md">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
            QR Junction
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="/#features" className="hover:text-white transition-colors no-underline">Features</Link>
          <Link href="/#usecases" className="hover:text-white transition-colors no-underline">Use Cases</Link>
          <Link href="/qr" className="hover:text-white transition-colors no-underline flex items-center gap-1.5 group/link">
            <span>Advanced Tool</span>
            <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90 group-hover/link:bg-primary group-hover/link:text-white transition-all">Free</span>
          </Link>
          <Link href="/blog" className="hover:text-white transition-colors no-underline">Blog</Link>
          <Link href="/faq" className="hover:text-white transition-colors no-underline">FAQ</Link>
          <Link href="/contact" className="hover:text-white transition-colors no-underline">Contact</Link>
        </nav>

        {/* Desktop CTA Action Button */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-24 h-9 bg-slate-900 border border-slate-850 rounded-xl animate-pulse" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="gradient-primary text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-primary hover:-translate-y-0.5 hover:shadow-primary-hover transition-all duration-200 flex items-center gap-1.5 no-underline"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-slate-350 hover:text-white font-medium text-xs transition-colors flex items-center gap-1 no-underline"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 no-underline shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-950 border-b border-slate-900 shadow-xl px-6 py-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col gap-4 text-sm font-medium text-slate-400">
            <Link href="/#features" onClick={() => setMobileOpen(false)} className="hover:text-white no-underline">Features</Link>
            <Link href="/#usecases" onClick={() => setMobileOpen(false)} className="hover:text-white no-underline">Use Cases</Link>
            <Link href="/qr" onClick={() => setMobileOpen(false)} className="hover:text-white no-underline flex items-center justify-between">
              <span>Advanced Tool</span>
              <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-bold">Free</span>
            </Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="hover:text-white no-underline">Blog</Link>
            <Link href="/faq" onClick={() => setMobileOpen(false)} className="hover:text-white no-underline">FAQ</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="hover:text-white no-underline">Contact</Link>
          </nav>
          
          <div className="pt-4 border-t border-slate-900 flex flex-col gap-3">
            {loading ? (
              <div className="w-full h-9 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
            ) : user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="gradient-primary text-white font-medium text-sm py-3 px-4 rounded-xl shadow-primary text-center block no-underline"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="bg-slate-900 text-white font-medium text-sm py-3 px-4 rounded-xl border border-slate-800 text-center block no-underline"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="gradient-primary text-white font-semibold text-sm py-3 px-4 rounded-xl text-center block no-underline"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
