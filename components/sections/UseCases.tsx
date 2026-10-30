'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Contact,
  Globe,
  Mail,
  Phone,
  Megaphone,
  QrCode,
  Sparkles,
  Star,
  UserPlus,
  UtensilsCrossed,
  Wifi,
} from 'lucide-react';

const MENU_ROWS = [
  { name: 'Masala dosa', price: '₹160', veg: true },
  { name: 'Paneer tikka', price: '₹280', veg: true },
  { name: 'Chicken biryani', price: '₹320', veg: false },
  { name: 'Filter coffee', price: '₹80', veg: true },
];

function PhoneScreen({ index, isActive }: { index: number; isActive: boolean }) {
  const [menuReady, setMenuReady] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [cardSaved, setCardSaved] = useState(false);
  const [linkUpdated, setLinkUpdated] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setMenuReady(false);
      setDraftReady(false);
      setCardSaved(false);
      setLinkUpdated(false);
      setLeadSaved(false);
      return;
    }

    const menuTimeout = setTimeout(() => setMenuReady(true), 1400);
    const draftTimeout = setTimeout(() => setDraftReady(true), 1200);
    const cardTimeout = setTimeout(() => setCardSaved(true), 1800);
    const linkTimeout = setTimeout(() => setLinkUpdated(true), 1400);
    const leadTimeout = setTimeout(() => setLeadSaved(true), 1500);

    return () => {
      clearTimeout(menuTimeout);
      clearTimeout(draftTimeout);
      clearTimeout(cardTimeout);
      clearTimeout(linkTimeout);
      clearTimeout(leadTimeout);
    };
  }, [isActive]);

  switch (index) {
    case 0:
      return (
        <div className="flex h-full flex-1 select-none flex-col bg-[#F6F3EE] text-left text-slate-800">
          <div className="border-b border-amber-100 bg-white px-3 pb-1.5 pt-2">
            <p className="text-[7px] font-bold uppercase tracking-wider text-emerald-700">Table 4 · Live menu</p>
            <h4 className="text-[12px] font-black leading-tight text-[#001B50]">Annapurna Kitchen</h4>
            <p className="text-[7.5px] text-slate-500">Sample screen · prices in rupees</p>
          </div>

          {!menuReady ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
              <div className="relative mb-3 h-24 w-[140px] overflow-hidden rounded-lg border border-dashed border-amber-300 bg-white shadow-sm">
                <div className="space-y-1.5 p-3">
                  <div className="h-1.5 w-16 rounded-sm bg-slate-300" />
                  <div className="h-1 w-full rounded-sm bg-slate-200" />
                  <div className="h-1 w-full rounded-sm bg-slate-200" />
                  <div className="h-1 w-4/5 rounded-sm bg-slate-200" />
                  <div className="h-1 w-full rounded-sm bg-slate-200" />
                </div>
                <div className="animate-scanner-beam absolute left-0 right-0 h-[2px] bg-emerald-500 shadow-md shadow-emerald-500/40" />
              </div>
              <p className="text-[9px] font-bold text-[#001B50]">Reading the paper menu</p>
              <p className="mt-1 max-w-[170px] text-[7.5px] leading-snug text-slate-500">
                Dish names and prices, ready for you to check
              </p>
            </div>
          ) : (
            <div className="animate-slideUp flex flex-1 flex-col px-3 py-2">
              <p className="mb-1.5 text-[7px] font-bold uppercase tracking-wider text-slate-400">Today’s card</p>
              <div className="space-y-1">
                {MENU_ROWS.map((row) => (
                  <div key={row.name} className="flex items-center justify-between rounded-lg border border-white bg-white px-2 py-1 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-[2px] border ${row.veg ? 'border-emerald-600' : 'border-rose-600'}`}>
                        <span className={`block h-1 w-1 rounded-full ${row.veg ? 'bg-emerald-600' : 'bg-rose-600'} m-px`} />
                      </span>
                      <span className="text-[8.5px] font-bold text-slate-800">{row.name}</span>
                    </div>
                    <span className="text-[8px] font-black text-[#001B50]">{row.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between rounded-lg bg-[#001B50] px-2.5 py-1.5 text-white">
                <span className="text-[8px] font-bold">2 on the plate</span>
                <span className="text-[8px] font-black">Send order</span>
              </div>
            </div>
          )}
        </div>
      );

    case 1:
      return (
        <div className="flex h-full flex-1 select-none flex-col bg-white px-3 pb-3 pt-3 text-left">
          <p className="text-[7px] font-bold uppercase tracking-wider text-amber-600">After the meal</p>
          <h4 className="mt-0.5 text-[12px] font-black leading-tight text-[#001B50]">How was lunch?</h4>
          <p className="text-[7.5px] text-slate-500">Annapurna Kitchen · sample screen</p>

          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
              />
            ))}
          </div>

          <div className={`mt-3 rounded-xl border px-2.5 py-2 ${draftReady ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
            <p className="text-[7px] font-bold uppercase tracking-wider text-amber-700">Optional draft</p>
            {draftReady ? (
              <p className="animate-slideUp mt-1 text-[8.5px] font-semibold leading-snug text-slate-800">
                The dosa was crisp and the table was ready when we walked in.
              </p>
            ) : (
              <p className="mt-1 text-[8px] text-slate-400">Writing a draft from this visit…</p>
            )}
            <p className="mt-1.5 text-[7px] leading-snug text-slate-500">The guest can edit every word, or ignore the draft.</p>
          </div>

          <div className="mt-auto space-y-1.5">
            <div className="rounded-lg bg-[#001B50] py-1.5 text-center text-[8.5px] font-bold text-white">
              Open Google review
            </div>
            <div className="rounded-lg border border-slate-200 bg-white py-1.5 text-center text-[8px] font-bold text-slate-600">
              Send a private note instead
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="flex h-full flex-1 select-none flex-col bg-slate-50 p-4 text-slate-800">
          <div className="relative flex h-20 items-end justify-center rounded-b-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-3">
            <div className="absolute inset-0 bg-white/10" />
          </div>

          <div className="relative z-10 -mt-8 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-white p-0.5 shadow-md">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-700 text-lg font-bold text-white">
                MS
              </div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <h4 className="text-[11px] font-black text-[#001B50]">Meera Shah</h4>
            <p className="text-[8.5px] font-bold text-slate-500">Owner</p>
            <p className="mt-0.5 text-[8px] font-extrabold text-[#0046a1]">Shah Stores</p>
          </div>

          <div className="mt-3.5 space-y-1.5">
            <div
              className={`flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-bold text-white transition-all duration-500 ${
                cardSaved ? 'bg-emerald-600' : 'bg-[#0046a1]'
              }`}
            >
              <UserPlus className="h-3 w-3" />
              <span>{cardSaved ? 'Contact saved' : 'Save contact'}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex w-[48%] items-center justify-center gap-1 rounded-md border border-slate-200 bg-white py-1.5 text-[8px] font-bold text-slate-700">
                <Mail className="h-2.5 w-2.5 text-slate-400" />
                <span>Email</span>
              </div>
              <div className="flex w-[48%] items-center justify-center gap-1 rounded-md border border-slate-200 bg-white py-1.5 text-[8px] font-bold text-slate-700">
                <Globe className="h-2.5 w-2.5 text-slate-400" />
                <span>Web</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex-1 space-y-2 text-left">
            <span className="block text-[7.5px] font-bold uppercase tracking-wider text-slate-400">Contact</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white p-1.5">
              <Phone className="h-3 w-3 text-[#0046a1]/80" />
              <div className="flex flex-col">
                <span className="text-[6.5px] font-medium leading-none text-slate-400">Phone</span>
                <span className="mt-0.5 text-[8px] font-bold text-slate-800">+91 98450 11220</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white p-1.5">
              <Mail className="h-3 w-3 text-[#0046a1]/80" />
              <div className="flex flex-col">
                <span className="text-[6.5px] font-medium leading-none text-slate-400">Email</span>
                <span className="mt-0.5 text-[8px] font-bold text-slate-800">meera@shahstores.in</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="flex h-full flex-1 select-none flex-col bg-slate-50 px-3 pb-3 pt-3 text-left">
          <p className="text-[7px] font-bold uppercase tracking-wider text-[#0046a1]">Dynamic QR</p>
          <h4 className="mt-0.5 text-[12px] font-black leading-tight text-[#001B50]">Same print. New page.</h4>
          <p className="text-[7.5px] text-slate-500">Sample screen · the square does not change</p>

          <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#001B50] text-white">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400">Printed code</p>
              <p className="text-[8.5px] font-bold text-[#001B50]">qrjunction.in/diwali</p>
            </div>
          </div>

          <div className="mt-2 space-y-1.5">
            <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
              <p className="text-[6.5px] font-bold uppercase tracking-wider text-slate-400">Was opening</p>
              <p className={`text-[8px] font-semibold ${linkUpdated ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                Last month’s offer
              </p>
            </div>
            <div className={`rounded-lg border px-2 py-1.5 ${linkUpdated ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
              <p className="text-[6.5px] font-bold uppercase tracking-wider text-emerald-700">Opens now</p>
              <p className="text-[8px] font-bold text-[#001B50]">
                {linkUpdated ? 'This week’s menu' : 'Waiting to update…'}
              </p>
            </div>
          </div>

          <p className="mt-auto text-[7.5px] leading-snug text-slate-500">
            Window, flyer, and counter can each be their own code. You see which one was scanned.
          </p>
        </div>
      );

    case 4:
      return (
        <div className="flex h-full flex-1 select-none flex-col bg-white px-3 pb-3 pt-3 text-left">
          <p className="text-[7px] font-bold uppercase tracking-wider text-violet-600">Diwali week · Window QR</p>
          <h4 className="mt-0.5 text-[12px] font-black leading-tight text-[#001B50]">Leave your details</h4>
          <p className="text-[7.5px] text-slate-500">Sample screen · this lead stays with the campaign</p>

          <div className="mt-3 space-y-1.5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p className="text-[6.5px] font-bold uppercase tracking-wider text-slate-400">Name</p>
              <p className="text-[8.5px] font-bold text-slate-800">Asha Rao</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p className="text-[6.5px] font-bold uppercase tracking-wider text-slate-400">Email</p>
              <p className="text-[8.5px] font-bold text-slate-800">asha@example.com</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p className="text-[6.5px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
              <p className="text-[8.5px] font-bold text-slate-800">+91 98450 22011</p>
            </div>
          </div>

          <div
            className={`mt-3 rounded-lg py-1.5 text-center text-[8.5px] font-bold text-white ${
              leadSaved ? 'bg-emerald-600' : 'bg-[#001B50]'
            }`}
          >
            {leadSaved ? 'Lead saved' : 'Save lead'}
          </div>

          <div className="mt-auto space-y-1">
            {['Shop window', 'MG Road flyer', 'Counter card'].map((place) => (
              <div key={place} className="flex items-center justify-between text-[7.5px]">
                <span className="font-semibold text-slate-600">{place}</span>
                <span className={`font-bold ${place === 'Shop window' && leadSaved ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {place === 'Shop window' && leadSaved ? 'New lead' : 'In this campaign'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

function PhoneMockup({ index, isActive, isMobile = false }: { index: number; isActive: boolean; isMobile?: boolean }) {
  return (
    <div
      className={`relative mx-auto flex h-[500px] w-[250px] flex-col overflow-hidden rounded-[38px] border-4 border-slate-900 bg-slate-900 shadow-2xl transition-all duration-700 sm:h-[520px] sm:w-[260px] ${
        isMobile ? 'my-8 scale-95' : 'scale-100'
      }`}
    >
      <div className="absolute left-1/2 top-2 z-30 flex h-4 w-20 -translate-x-1/2 items-center justify-between rounded-full bg-slate-950 px-2">
        <div className="h-1 w-1 rounded-full bg-slate-800" />
        <div className="h-0.5 w-8 rounded-full bg-slate-800" />
      </div>

      <div className="z-20 flex select-none items-center justify-between border-b border-slate-100 bg-white px-5 pb-2 pt-6 text-[8px] font-bold text-slate-500">
        <span>9:41 AM</span>
        <div className="flex items-center gap-1">
          <div className="flex h-1.5 items-end gap-[1px]">
            <div className="h-[2px] w-[1.5px] rounded-sm bg-slate-400" />
            <div className="h-[3.5px] w-[1.5px] rounded-sm bg-slate-400" />
            <div className="h-[5px] w-[1.5px] rounded-sm bg-slate-600" />
          </div>
          <Wifi className="h-2.5 w-2.5 text-slate-500" />
          <div className="flex h-2 w-3.5 items-center rounded-sm border border-slate-400 p-[0.5px]">
            <div className="h-full w-full rounded-sm bg-slate-500" />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden bg-white">
        <PhoneScreen index={index} isActive={isActive} />
      </div>

      <div className="absolute bottom-1 left-1/2 z-30 h-1 w-20 -translate-x-1/2 rounded-full bg-slate-300" />
    </div>
  );
}

const useCases = [
  {
    icon: UtensilsCrossed,
    title: 'Restaurant QR menu',
    description:
      'Photograph the paper menu you already print. We read the dish names and prices and turn them into a phone menu guests open from the table. Most menus are ready for you to check in under a minute. You approve the list before anyone else sees it.',
    bgColor: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    accent: '#047857',
    bullets: [
      'A photo or PDF of the paper menu becomes categories, dishes, and prices',
      'Change a price or hide a sold-out dish later — the printed QR stays on the table',
      'One code for the restaurant, or a different code on each table',
      'Guests can send an order from the phone when you switch ordering on',
    ],
    cta: 'Start a restaurant menu',
    ctaLink: '/register',
  },
  {
    icon: Star,
    title: 'AI review QR',
    description:
      'Put one QR on the bill folder or the counter. The guest picks a star rating and can tap a short draft written for that visit. They change any word before it goes anywhere. Happy or not, you still read the note in your inbox.',
    bgColor: 'bg-amber-50 border-amber-100 text-amber-700',
    accent: '#D97706',
    bullets: [
      'Optional wording help — the guest edits it or writes their own line',
      'The same QR can open your real Google review page',
      'Works for restaurants, clinics, salons, and shops',
      'Ratings and comments land in one inbox you actually check',
    ],
    cta: 'Set up a review QR',
    ctaLink: '/register',
  },
  {
    icon: Contact,
    title: 'Digital business cards',
    description:
      'Print one QR on a visiting card. The other person scans it and saves your name, phone, and email into their contacts. If your number changes, update it once. Old cards still work.',
    bgColor: 'bg-blue-50 border-blue-100 text-blue-700',
    accent: '#0046a1',
    bullets: [
      'Saves straight into the phone’s contact list',
      'Update phone, address, or email without ordering new cards',
      'Add your website or WhatsApp on the same card',
    ],
    cta: 'Make a digital card',
    ctaLink: '/vcard-qr-code-generator',
  },
  {
    icon: QrCode,
    title: 'Dynamic QR codes',
    description:
      'A dynamic QR is a short link you control. The printed square stays on the poster. You change the page it opens, and you can see that this code was scanned. A static download cannot do that — the destination is baked into the image.',
    bgColor: 'bg-sky-50 border-sky-100 text-sky-800',
    accent: '#0369a1',
    bullets: [
      'Change the offer, menu, or website after the QR is already printed',
      'Use a different code on the window, the flyer, and the counter',
      'Scans for each code show up in your account',
      'A plain website or Wi-Fi code can still be a static download with no signup',
    ],
    cta: 'Create a dynamic QR',
    ctaLink: '/register',
  },
  {
    icon: Megaphone,
    title: 'Campaigns and leads',
    description:
      'Group those codes into a campaign — Diwali week, a new branch, a college fest. Each code still has its own scans. When someone leaves a name and email on the page, that lead is tagged with the campaign and the code they scanned.',
    bgColor: 'bg-violet-50 border-violet-100 text-violet-700',
    accent: '#6d28d9',
    bullets: [
      'One campaign can hold several QR codes, with a start and end date if you want one',
      'See which code brought the scan: window, flyer, or counter',
      'A landing page can ask for a name, email, and phone',
      'Leads land in one list, with notes and a status you can update',
    ],
    cta: 'Start a campaign',
    ctaLink: '/register',
  },
];

export default function UseCases() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(index);
          }
        });
      },
      { root: null, rootMargin: '-30% 0px -40% 0px', threshold: 0.1 }
    );

    refs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      refs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const scrollToSection = (index: number) => {
    refs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section
      ref={sectionRef}
      id="usecases"
      className="relative scroll-mt-[var(--site-header-offset)] bg-gradient-to-b from-white via-slate-50 to-white py-24"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scanner-beam {
          0%, 100% { top: 12%; opacity: 0.85; }
          50% { top: 78%; opacity: 0.85; }
        }
        @keyframes slideUp {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-scanner-beam {
          animation: scanner-beam 1.6s infinite ease-in-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-scanner-beam, .animate-slideUp { animation: none; }
        }
      `,
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-px w-full bg-slate-200/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center md:mb-24">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Built for owners</span>
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#001B50] md:text-4xl">
            Menus, reviews, visiting cards, and campaign QR codes
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Restaurant owners get a live menu from a photo of the paper card. Shops collect a Google review from one
            scan. A dynamic code can change after you print it, and several of those codes can sit in one campaign so
            you know which poster brought the lead.
          </p>
        </div>

        <div className="relative flex flex-col items-start gap-12 lg:flex-row lg:gap-16">
          <div className="z-20 hidden items-center justify-center lg:sticky lg:top-32 lg:flex lg:w-1/2 lg:flex-col lg:self-start">
            <div className="relative flex w-full items-center justify-center">
              <div
                className="pointer-events-none absolute h-[360px] w-[360px] rounded-full opacity-15 blur-[110px] transition-all duration-1000"
                style={{
                  background: useCases[activeIndex]?.accent || '#0046a1',
                  transform: 'translate(-10px, -15px)',
                }}
              />
              <PhoneMockup index={activeIndex} isActive />
              <div className="absolute right-4 flex flex-col gap-3.5 xl:right-10">
                {useCases.map((useCase, idx) => {
                  const Icon = useCase.icon;
                  return (
                    <button
                      key={useCase.title}
                      type="button"
                      onClick={() => scrollToSection(idx)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500 ${
                        activeIndex === idx
                          ? 'scale-110 border-[#001B50] bg-[#001B50] text-white shadow-md'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                      title={useCase.title}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2">
            <div className="absolute bottom-6 left-4 top-6 w-[2px] bg-slate-200/80 lg:left-6" />
            <div
              className="absolute left-[15px] top-6 w-[2px] bg-gradient-to-b from-[#0046a1] to-emerald-600 transition-all duration-700 ease-out lg:left-[23px]"
              style={{ height: `${(activeIndex / (useCases.length - 1)) * 92}%` }}
            />

            <div className="flex flex-col gap-16 lg:gap-24">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                const isActive = activeIndex === index;

                return (
                  <div
                    key={useCase.title}
                    ref={(el) => {
                      refs.current[index] = el;
                    }}
                    data-index={index}
                    className={`relative pl-12 transition-opacity duration-700 lg:pl-16 ${isActive ? 'opacity-100' : 'opacity-50 lg:opacity-40'}`}
                  >
                    <button
                      type="button"
                      onClick={() => scrollToSection(index)}
                      className={`absolute left-[16px] top-8 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white transition-all duration-500 lg:left-[24px] ${
                        isActive ? 'scale-125 border-[#0046a1]' : 'border-slate-300 hover:border-slate-400'
                      }`}
                      aria-label={useCase.title}
                    >
                      {isActive && <span className="h-2 w-2 rounded-full bg-[#0046a1]" />}
                    </button>

                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] font-black tracking-wider text-slate-400">0{index + 1}</span>
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${useCase.bgColor}`}>
                          <Icon className="h-3.5 w-3.5" />
                          <span>{useCase.title}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-black leading-tight tracking-tight text-[#001B50] md:text-2xl">{useCase.title}</h3>
                        <p className="text-sm leading-relaxed text-slate-600 md:text-base">{useCase.description}</p>
                      </div>

                      <ul className="space-y-2.5">
                        {useCase.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2.5 text-xs text-slate-700 md:text-sm">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: useCase.accent }} />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={useCase.ctaLink}
                        className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0046a1] hover:text-[#003b8f] md:text-sm"
                      >
                        <span>{useCase.cta}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <div className="mx-auto mt-6 flex w-full max-w-[280px] justify-center rounded-2xl bg-slate-50/50 pt-2 lg:hidden">
                        <PhoneMockup index={index} isActive={isActive} isMobile />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-4xl border-t border-slate-200 pt-10 text-center md:mt-32">
          <p className="mx-auto max-w-3xl px-4 text-xs leading-relaxed text-slate-500 md:text-sm">
            The restaurant menu, the review inbox, dynamic links, campaigns, and lead lists need a free account, because
            those stay editable after you print. A visiting-card QR, a website QR, and a Wi-Fi QR can still be downloaded
            here with no signup.
          </p>
        </div>
      </div>
    </section>
  );
}
