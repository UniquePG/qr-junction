"use client";

import {
  CheckCircle2,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Twitter,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface PublicLandingPageProps {
  landingPage: {
    id: number;
    title: string;
    theme: string;
    profileName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    socialLinks: any;
    buttons: any;
    userId: number;
  };
  qrCodeId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

export default function PublicLandingPageClient({
  landingPage,
  qrCodeId,
  utmSource,
  utmMedium,
  utmCampaign,
}: PublicLandingPageProps) {
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Custom Lead Capture Form states (optional feature for smart pages)
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false);

  const themeClasses: {
    [key: string]: {
      wrapper: string;
      card: string;
      text: string;
      subtext: string;
      btn: string;
      social: string;
      input: string;
      successCard: string;
      successIcon: string;
      successText: string;
      successSubtext: string;
    };
  } = {
    dark: {
      wrapper: "bg-[#0b0f19] text-white",
      card: "bg-slate-900/50 border border-slate-800/80 backdrop-blur-md",
      text: "text-white",
      subtext: "text-slate-400",
      btn: "bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-white hover:border-slate-700",
      social:
        "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800",
      input:
        "w-full bg-black/30 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary/50 transition-all placeholder-slate-500",
      successCard:
        "bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-5 text-center space-y-2",
      successIcon:
        "inline-flex p-2 bg-emerald-500/10 rounded-full text-emerald-400 mb-1",
      successText: "font-bold text-white text-sm",
      successSubtext: "text-[11px] text-slate-400",
    },
    light: {
      wrapper: "bg-slate-55 text-slate-800 bg-[#f8fafc]",
      card: "bg-white border border-slate-100 shadow-md",
      text: "text-slate-900",
      subtext: "text-slate-500",
      btn: "bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 hover:border-slate-300",
      social:
        "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm",
      input:
        "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-primary/50 transition-all placeholder-slate-400",
      successCard:
        "bg-emerald-50 border border-emerald-250 rounded-2xl p-5 text-center space-y-2",
      successIcon:
        "inline-flex p-2 bg-emerald-500/10 rounded-full text-emerald-600 mb-1",
      successText: "font-bold text-emerald-950 text-sm",
      successSubtext: "text-[11px] text-emerald-700",
    },
    sunset: {
      wrapper:
        "bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white",
      card: "bg-black/25 border border-white/10 backdrop-blur-md shadow-2xl",
      text: "text-white",
      subtext: "text-orange-100/85",
      btn: "bg-white/10 hover:bg-white/20 border border-white/20 text-white",
      social: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
      input:
        "w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-white/40 transition-all placeholder-orange-200/50",
      successCard:
        "bg-black/20 border border-white/10 rounded-2xl p-5 text-center space-y-2",
      successIcon: "inline-flex p-2 bg-white/10 rounded-full text-white mb-1",
      successText: "font-bold text-white text-sm",
      successSubtext: "text-[11px] text-orange-100/80",
    },
    ocean: {
      wrapper:
        "bg-gradient-to-br from-blue-900 via-indigo-950 to-teal-900 text-white",
      card: "bg-black/20 border border-white/5 backdrop-blur-md shadow-2xl",
      text: "text-white",
      subtext: "text-blue-200/80",
      btn: "bg-white/5 hover:bg-white/15 border border-white/10 text-white",
      social: "bg-white/5 hover:bg-white/15 text-white border border-white/10",
      input:
        "w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-white/40 transition-all placeholder-blue-200/50",
      successCard:
        "bg-black/20 border border-white/10 rounded-2xl p-5 text-center space-y-2",
      successIcon: "inline-flex p-2 bg-white/10 rounded-full text-white mb-1",
      successText: "font-bold text-white text-sm",
      successSubtext: "text-[11px] text-blue-200/80",
    },
    glassmorphism: {
      wrapper:
        "bg-gradient-to-tr from-violet-950 via-[#070313] to-indigo-950 text-white",
      card: "bg-white/5 border border-white/10 backdrop-blur-lg shadow-inner shadow-white/5",
      text: "text-white",
      subtext: "text-slate-300",
      btn: "bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium hover:border-primary/40",
      social: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
      input:
        "w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary/50 transition-all placeholder-slate-500",
      successCard:
        "bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-2",
      successIcon: "inline-flex p-2 bg-white/10 rounded-full text-white mb-1",
      successText: "font-bold text-white text-sm",
      successSubtext: "text-[11px] text-slate-300",
    },
  };

  const currentTheme = themeClasses[landingPage.theme] || themeClasses.dark;

  const logClickConversion = async (
    eventName: string,
    eventType: string,
    urlRedirect?: string,
  ) => {
    // If we have a QR Code context, log the scan conversion event
    if (qrCodeId) {
      try {
        await fetch("/api/conversions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrCodeId: parseInt(qrCodeId, 10),
            eventType,
            eventName,
            value: 5.0, // minor conversion value for link click
          }),
        });
      } catch (err) {
        console.error("Failed to log click conversion:", err);
      }
    }

    if (urlRedirect) {
      window.open(urlRedirect, "_blank", "noopener,noreferrer");
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setSubmitting("lead");
    try {
      const payload: any = {
        name: leadName,
        email: leadEmail,
        userId: landingPage.userId,
      };

      if (qrCodeId) {
        payload.qrCodeId = parseInt(qrCodeId, 10);
      }

      // 1. Submit lead details
      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!leadRes.ok) throw new Error("Lead registration failed.");

      // 2. Track lead form conversion event
      if (qrCodeId) {
        await fetch("/api/conversions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrCodeId: parseInt(qrCodeId, 10),
            eventType: "FORM_SUBMIT",
            eventName: "landing_page_lead_form",
            value: 15.0, // higher value for lead acquisition
          }),
        });
      }

      setLeadCaptured(true);
      toast.success("Thank you for subscribing!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  // Safe JSON parsers
  const parseSocialLinks = () => {
    try {
      return typeof landingPage.socialLinks === "string"
        ? JSON.parse(landingPage.socialLinks)
        : landingPage.socialLinks || {};
    } catch (e) {
      return {};
    }
  };

  const parseButtons = () => {
    try {
      const btns =
        typeof landingPage.buttons === "string"
          ? JSON.parse(landingPage.buttons)
          : landingPage.buttons || [];
      return Array.isArray(btns)
        ? btns.sort((a, b) => (a.order || 0) - (b.order || 0))
        : [];
    } catch (e) {
      return [];
    }
  };

  const socialLinks = parseSocialLinks();
  const buttons = parseButtons();

  const getSocialIcon = (key: string) => {
    switch (key) {
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "facebook":
        return <Facebook className="w-5 h-5" />;
      case "linkedin":
        return <Linkedin className="w-5 h-5" />;
      case "twitter":
        return <Twitter className="w-5 h-5" />;
      case "whatsapp":
        return <MessageCircle className="w-5 h-5" />;
      case "phone":
        return <Phone className="w-5 h-5" />;
      case "email":
        return <Mail className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getSocialHref = (key: string, value: string) => {
    if (key === "phone") return `tel:${value}`;
    if (key === "email") return `mailto:${value}`;
    if (key === "whatsapp") {
      const cleanNum = value.replace(/\+/g, "").replace(/\s/g, "");
      return `https://wa.me/${cleanNum}`;
    }
    return value;
  };

  return (
    <div
      className={`min-h-screen py-16 px-4 flex flex-col items-center justify-start ${currentTheme.wrapper} transition-colors duration-500 overflow-y-auto`}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-8 ${currentTheme.card} transition-all duration-300 mt-4`}
      >
        {/* Profile Details Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          {landingPage.avatarUrl ? (
            <img
              src={landingPage.avatarUrl}
              alt={landingPage.profileName || "Profile Avatar"}
              className="w-24 h-24 rounded-full object-cover border-2 border-white/20 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-dashed border-white/20 flex items-center justify-center text-3xl font-extrabold text-white shadow-inner select-none">
              {landingPage.profileName
                ? landingPage.profileName.charAt(0).toUpperCase()
                : landingPage.title.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <h1
              className={`text-xl font-bold tracking-tight ${currentTheme.text}`}
            >
              {landingPage.profileName || landingPage.title}
            </h1>
            {landingPage.bio && (
              <p
                className={`text-xs ${currentTheme.subtext} px-2 leading-relaxed max-w-sm`}
              >
                {landingPage.bio}
              </p>
            )}
          </div>
        </div>

        {/* Social Links Row */}
        {Object.keys(socialLinks).length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(socialLinks).map(([key, val]) => {
              if (!val) return null;
              return (
                <button
                  key={key}
                  onClick={() =>
                    logClickConversion(
                      `social_${key}`,
                      key === "whatsapp"
                        ? "WHATSAPP_CLICK"
                        : key === "phone"
                          ? "CALL_CLICK"
                          : "CUSTOM",
                      getSocialHref(key, val as string),
                    )
                  }
                  className={`p-3 rounded-full transition-all active:scale-95 duration-250 cursor-pointer flex items-center justify-center ${currentTheme.social}`}
                  title={key}
                >
                  {getSocialIcon(key)}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Buttons Stack */}
        {buttons.length > 0 && (
          <div className="space-y-3.5 pt-2">
            {buttons.map((btn: any) => (
              <button
                key={btn.id}
                onClick={() =>
                  logClickConversion(`btn_${btn.label}`, "CUSTOM", btn.url)
                }
                className={`w-full py-3.5 px-5 rounded-2xl flex items-center justify-between text-xs font-semibold tracking-wide transition-all duration-300 active:scale-98 cursor-pointer text-left ${currentTheme.btn}`}
              >
                <span>{btn.label}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Lead Capture Widget */}
        <div className="border-t border-white/10 pt-6">
          {leadCaptured ? (
            <div className={currentTheme.successCard}>
              <div className={currentTheme.successIcon}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className={currentTheme.successText}>
                Subscription Confirmed!
              </h4>
              <p className={currentTheme.successSubtext}>
                Thanks for connecting. We'll send premium updates directly to
                your email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <div className="text-center sm:text-left mb-2">
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${currentTheme.text}`}
                >
                  Connect With Us
                </h4>
                <p className={`text-[10px] ${currentTheme.subtext} mt-0.5`}>
                  Submit details below to subscribe for exclusive releases.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className={currentTheme.input}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className={currentTheme.input}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting === "lead"}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 active:scale-95 border-none"
              >
                {submitting === "lead" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Subscribe Details</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Branding link */}
      <div className="mt-8 text-[10px] text-slate-500 flex items-center gap-1 select-none">
        <span>Powered by</span>
        <span className="font-bold text-slate-400">QR Junction</span>
      </div>
    </div>
  );
}
