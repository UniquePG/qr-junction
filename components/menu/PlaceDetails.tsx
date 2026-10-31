'use client';

import { useState, type ReactElement, type ReactNode } from 'react';
import { WEEKDAYS, readHours, type WeekHours, type WeekdayKey } from '@/lib/restaurant/profile';

const BY_INDEX: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function clock(value: string) {
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const twelve = hour % 12 || 12;
  return minute === 0 ? `${twelve} ${suffix}` : `${twelve}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function span(row: WeekHours[WeekdayKey]) {
  if (row.closed) return 'Closed';
  return `${clock(row.open)} – ${clock(row.close)}`;
}

function digits(value: string) {
  return value.replace(/\D/g, '');
}

function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:opacity-90"
    >
      {children}
    </a>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden="true">
      <circle cx="18" cy="18" r="18" fill="#2563EB" />
      <path
        fill="#fff"
        transform="translate(9 9) scale(0.75)"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden="true">
      <circle cx="18" cy="18" r="18" fill="#25D366" />
      <path
        fill="#fff"
        d="M18.2 8.6c-5 0-9 4-9 9 0 1.6.4 3.1 1.2 4.4l-1.2 4.4 4.5-1.2c1.3.7 2.7 1.1 4.2 1.1h.1c5 0 9-4 9-9s-4-9-8.8-9zm5.2 12.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.8-.3-1.4-.5-2.4-1-4-3.5-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.8 2 .8 2.1.1.1.1.3 0 .4-.1.2-.2.3-.3.5l-.4.5c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1.9 2 1.1 2.3 1.3.3.1.4.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.2.5.2.5.4.1.2.1.8-.1 1.4z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden="true">
      <circle cx="18" cy="18" r="18" fill="#EA4335" />
      <rect x="9.5" y="12" width="17" height="12" rx="1.6" fill="#fff" />
      <path d="M10.2 13.1 18 18.4l7.8-5.3" fill="none" stroke="#EA4335" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden="true">
      <circle cx="18" cy="18" r="18" fill="#1A73E8" />
      <circle cx="18" cy="18" r="7.2" fill="none" stroke="#fff" strokeWidth="1.5" />
      <ellipse cx="18" cy="18" rx="3.2" ry="7.2" fill="none" stroke="#fff" strokeWidth="1.5" />
      <path d="M11 18h14M12.4 14.2h11.2M12.4 21.8h11.2" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden="true">
      <defs>
        <linearGradient id="menu-instagram" x1="6" y1="30" x2="30" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEDA75" />
          <stop offset="0.25" stopColor="#FA7E1E" />
          <stop offset="0.5" stopColor="#D62976" />
          <stop offset="0.75" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="18" fill="url(#menu-instagram)" />
      <rect x="11" y="11" width="14" height="14" rx="4" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="3.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="22.4" cy="13.6" r="1" fill="#fff" />
    </svg>
  );
}

export function MenuPlaceDetails({
  phone,
  whatsapp,
  email,
  website,
  instagram,
  hours,
  muted,
}: {
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  instagram?: string | null;
  hours?: unknown;
  muted: string;
}) {
  const [open, setOpen] = useState(false);
  const week = hours ? readHours(hours) : null;
  const call = phone?.trim() || '';
  const chat = whatsapp?.trim() || '';
  const mail = email?.trim() || '';
  const site = website?.trim() || '';
  const handle = instagram?.trim().replace(/^@/, '') || '';
  const siteHref = site && !/^https?:\/\//i.test(site) ? `https://${site}` : site;
  const links = [
    call ? { key: 'phone', href: `tel:${call.replace(/\s/g, '')}`, label: `Call ${call}`, icon: <PhoneIcon /> } : null,
    chat ? { key: 'whatsapp', href: `https://wa.me/${digits(chat)}`, label: `WhatsApp ${chat}`, icon: <WhatsAppIcon /> } : null,
    mail ? { key: 'email', href: `mailto:${mail}`, label: `Email ${mail}`, icon: <MailIcon /> } : null,
    siteHref ? { key: 'website', href: siteHref, label: 'Website', icon: <WebIcon /> } : null,
    handle ? { key: 'instagram', href: `https://instagram.com/${encodeURIComponent(handle)}`, label: `Instagram @${handle}`, icon: <InstagramIcon /> } : null,
  ].filter((link): link is { key: string; href: string; label: string; icon: ReactElement } => link !== null);
  if (!week && links.length === 0) return null;

  const today = BY_INDEX[new Date().getDay()];
  const todayRow = week ? week[today] : null;
  const todayLine = todayRow
    ? todayRow.closed
      ? 'Closed today'
      : `Open today · ${span(todayRow)}`
    : '';

  return (
    <div className="mt-4 w-full border-t border-current/10 pt-3 text-left">
      {week && todayRow ? (
        <div>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] opacity-60">Hours</span>
              <span className="mt-0.5 block text-sm font-medium">{todayLine}</span>
            </span>
            <span className={`shrink-0 text-xs font-semibold ${muted}`}>{open ? 'Hide' : 'Full week'}</span>
          </button>
          {open ? (
            <ul className="mt-3 space-y-1.5">
              {WEEKDAYS.map((day) => {
                const row = week[day.key];
                const current = day.key === today;
                return (
                  <li key={day.key} className={`flex items-baseline justify-between gap-3 text-sm ${current ? 'font-semibold' : muted}`}>
                    <span>{day.label}{current ? ' · today' : ''}</span>
                    <span className="whitespace-nowrap">{span(row)}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
      {links.length > 0 ? (
        <div className={`flex flex-wrap items-center gap-2 ${week ? 'mt-3' : ''}`}>
          {links.map((link) => (
            <IconLink key={link.key} href={link.href} label={link.label}>
              {link.icon}
            </IconLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}
