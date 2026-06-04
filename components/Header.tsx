"use client";

import { useAuth } from "@/components/AuthContext";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/95 border-b border-slate-200/80 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group no-underline">
          <Image
            src="/NewLogo/Logo.png"
            alt="QR Junction"
            width={120}
            height={42}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link
            href="/#features"
            className="hover:text-[#001B50] transition-colors no-underline"
          >
            Features
          </Link>
          <Link
            href="/#usecases"
            className="hover:text-[#001B50] transition-colors no-underline"
          >
            Use Cases
          </Link>
          <Link
            href="/qr"
            className="hover:text-[#001B50] transition-colors no-underline flex items-center gap-1.5 group/link"
          >
            <span>Advanced Tool</span>
            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90 transition-all">
              Free
            </span>
          </Link>
          <Link
            href="/blog"
            className="hover:text-[#001B50] transition-colors no-underline"
          >
            Blog
          </Link>
          <Link
            href="/faq"
            className="hover:text-[#001B50] transition-colors no-underline"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#001B50] transition-colors no-underline"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop CTA Action Button */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-24 h-9 bg-slate-100 border border-slate-200 rounded-xl animate-pulse" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="bg-[#001B50] hover:bg-[#00143c] text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5 no-underline h-[40px] justify-center"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-[#001B50] font-semibold text-xs transition-colors flex items-center gap-1 no-underline"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:bg-primary-hover text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all duration-200 no-underline shadow-sm h-[40px] flex items-center justify-center border-none"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1 text-slate-600 hover:text-[#001B50] transition-colors cursor-pointer"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl px-6 py-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col gap-4 text-sm font-medium text-slate-600">
            <Link
              href="/#features"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#001B50] no-underline"
            >
              Features
            </Link>
            <Link
              href="/#usecases"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#001B50] no-underline"
            >
              Use Cases
            </Link>
            <Link
              href="/qr"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#001B50] no-underline flex items-center justify-between"
            >
              <span>Advanced Tool</span>
              <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-bold">
                Free
              </span>
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#001B50] no-underline"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#001B50] no-underline"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="hover:text-[#001B50] no-underline"
            >
              Contact
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            {loading ? (
              <div className="w-full h-9 bg-slate-100 border border-slate-200 rounded-xl animate-pulse" />
            ) : user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="bg-[#001B50] hover:bg-[#00143c] text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-sm text-center block no-underline"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="bg-slate-50 text-[#001B50] font-semibold text-sm py-3 px-4 rounded-xl border border-slate-200 text-center block no-underline"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3 px-4 rounded-xl text-center block no-underline border-none"
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
