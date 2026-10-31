'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { restaurantService, uploadService } from '@/lib/api';
import {
  COUNTRIES,
  CURRENCIES,
  LANGUAGES,
  VENUE_TYPES,
  WEEKDAYS,
  defaultWeek,
  readHours,
  type DayHours,
  type WeekHours,
  type WeekdayKey,
} from '@/lib/restaurant/profile';
import { Image as ImageIcon, Loader2, Store } from 'lucide-react';
import { toast } from 'react-toastify';

type ProfileForm = {
  name: string;
  description: string;
  logoUrl: string;
  coverImage: string;
  currency: string;
  taxRate: number;
  taxName: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  venueType: string;
  cuisine: string;
  language: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  gstin: string;
  fssai: string;
  openingHours: WeekHours;
  showOpeningHours: boolean;
};

const emptyForm = (): ProfileForm => ({
  name: '',
  description: '',
  logoUrl: '',
  coverImage: '',
  currency: 'INR',
  taxRate: 0,
  taxName: 'GST',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  instagram: '',
  venueType: '',
  cuisine: '',
  language: 'en',
  addressLine1: '',
  addressLine2: '',
  city: '',
  district: '',
  state: '',
  country: 'India',
  pincode: '',
  gstin: '',
  fssai: '',
  openingHours: defaultWeek(),
  showOpeningHours: false,
});

const fieldClass =
  'h-11 w-full min-w-0 rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm text-[#2A211C] outline-none transition placeholder:text-[#B3A59B] focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15';

function textValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

export default function RestaurantProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [looking, setLooking] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [lookupNote, setLookupNote] = useState('');
  const [localities, setLocalities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [customCountry, setCustomCountry] = useState(false);
  const [data, setData] = useState<ProfileForm>(emptyForm);
  const lastLookup = useRef('');
  const lookupSeq = useRef(0);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await restaurantService.getProfile();
        if (res.ok) {
          const json = await res.json();
          const restaurant = json.restaurant;
          if (restaurant) {
            const pincode = textValue(restaurant.pincode);
            const country = textValue(restaurant.country) || 'India';
            lastLookup.current = pincode;
            setCustomCountry(Boolean(restaurant.country) && !(COUNTRIES as readonly string[]).includes(country));
            setData({
              name: textValue(restaurant.name),
              description: textValue(restaurant.description),
              logoUrl: textValue(restaurant.logoUrl),
              coverImage: textValue(restaurant.coverImage),
              currency: textValue(restaurant.currency) || 'INR',
              taxRate: Number(restaurant.taxRate) || 0,
              taxName: textValue(restaurant.taxName) || 'GST',
              phone: textValue(restaurant.phone),
              whatsapp: textValue(restaurant.whatsapp),
              email: textValue(restaurant.email),
              website: textValue(restaurant.website),
              instagram: textValue(restaurant.instagram),
              venueType: textValue(restaurant.venueType),
              cuisine: textValue(restaurant.cuisine),
              language: textValue(restaurant.language) || 'en',
              addressLine1: textValue(restaurant.addressLine1),
              addressLine2: textValue(restaurant.addressLine2),
              city: textValue(restaurant.city),
              district: textValue(restaurant.district),
              state: textValue(restaurant.state),
              country,
              pincode,
              gstin: textValue(restaurant.gstin),
              fssai: textValue(restaurant.fssai),
              openingHours: readHours(restaurant.openingHours),
              showOpeningHours: restaurant.showOpeningHours === true,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch restaurant profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchRestaurant();
  }, [user]);

  const lookupPin = useCallback(async (pin: string, force = false) => {
    if (!/^\d{6}$/.test(pin)) {
      setLookupNote('Indian PIN codes are 6 digits.');
      return;
    }
    if (!force && lastLookup.current === pin) return;
    const id = ++lookupSeq.current;
    lastLookup.current = pin;
    setLooking(true);
    setLookupNote('Looking up this PIN…');
    try {
      const res = await restaurantService.lookupAddress({ kind: 'pincode', pin });
      const json = await res.json();
      if (id !== lookupSeq.current) return;
      if (!res.ok) {
        lastLookup.current = '';
        setLocalities([]);
        setLookupNote(json.error || 'No post office found. Type the city, district, and state.');
        return;
      }
      setLocalities(Array.isArray(json.localities) ? json.localities : []);
      setData((prev) =>
        prev.pincode === pin
          ? {
              ...prev,
              city: json.city || prev.city,
              district: json.district || prev.district,
              state: json.state || prev.state,
              country: 'India',
            }
          : prev,
      );
      const districtLabel =
        json.district && json.district !== json.city ? `${json.district} district` : null;
      const place = [json.city, districtLabel, json.state].filter(Boolean).join(', ');
      setLookupNote(place ? `Filled from India Post: ${place}.` : 'PIN matched.');
    } catch {
      if (id !== lookupSeq.current) return;
      lastLookup.current = '';
      setLookupNote('PIN lookup is unavailable. Type the city, district, and state.');
    } finally {
      if (id === lookupSeq.current) setLooking(false);
    }
  }, []);

  useEffect(() => {
    if (data.country !== 'India' || !/^\d{6}$/.test(data.pincode)) return;
    if (lastLookup.current === data.pincode) return;
    const pin = data.pincode;
    const timer = window.setTimeout(() => {
      void lookupPin(pin);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [data.country, data.pincode, lookupPin]);

  useEffect(() => {
    const country = data.country.trim();
    if (!country || country === 'India') {
      setStates([]);
      setStatesLoading(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setStatesLoading(true);
      restaurantService
        .lookupAddress({ kind: 'states', country })
        .then(async (res) => {
          const json = await res.json();
          if (cancelled) return;
          setStates(res.ok && Array.isArray(json.states) ? json.states : []);
        })
        .catch(() => {
          if (!cancelled) setStates([]);
        })
        .finally(() => {
          if (!cancelled) setStatesLoading(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [data.country]);

  useEffect(() => {
    if (!data.country || data.country === 'India' || !data.state) {
      setCities([]);
      return;
    }
    const country = data.country;
    const state = data.state;
    let cancelled = false;
    restaurantService
      .lookupAddress({ kind: 'cities', country, state })
      .then(async (res) => {
        const json = await res.json();
        if (cancelled) return;
        setCities(res.ok && Array.isArray(json.cities) ? json.cities : []);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });
    return () => {
      cancelled = true;
    };
  }, [data.country, data.state]);

  const setField = (name: keyof ProfileForm, value: string | number) => {
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const chooseCountry = (next: string) => {
    if (next === 'Other') {
      if (customCountry) return;
    } else if (!customCountry && next === data.country) {
      return;
    }
    setLocalities([]);
    setLookupNote('');
    lastLookup.current = '';
    if (next === 'Other') {
      setCustomCountry(true);
      setData((prev) => ({ ...prev, country: '', state: '', city: '', district: '', pincode: '' }));
      return;
    }
    setCustomCountry(false);
    setData((prev) => ({ ...prev, country: next, state: '', city: '', district: '', pincode: '' }));
  };

  const setDay = (key: WeekdayKey, patch: Partial<DayHours>) => {
    setData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [key]: { ...prev.openingHours[key], ...patch },
      },
    }));
  };

  const copyMonday = () => {
    setData((prev) => {
      const monday = { ...prev.openingHours.mon };
      const openingHours = { ...prev.openingHours };
      for (const day of WEEKDAYS) openingHours[day.key] = { ...monday };
      return { ...prev, openingHours };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'coverImage') => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Please upload an image smaller than 2MB.');
      return;
    }
    if (field === 'logoUrl') setUploadingLogo(true);
    else setUploadingCover(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await uploadService.file(uploadData);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed');
      setData((prev) => ({ ...prev, [field]: json.url }));
      toast.success(field === 'logoUrl' ? 'Logo uploaded.' : 'Cover uploaded.');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image.');
    } finally {
      if (field === 'logoUrl') setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!data.name.trim()) {
      toast.error('Restaurant name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await restaurantService.saveProfile(data);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not save details.');
      toast.success('Restaurant profile saved.');
      window.dispatchEvent(new Event('qrj-restaurant-profile'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
      </div>
    );
  }

  const india = data.country === 'India';
  const stateOptions = data.state && !states.includes(data.state) ? [data.state, ...states] : states;
  const placeLine = [data.venueType, data.city].filter(Boolean).join(' · ');

  return (
    <form
      className="mx-auto w-full max-w-6xl pb-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C4622D]">Setup</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410] sm:text-3xl">Restaurant profile</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6B5A50]">
            Identity, address, hours, and the language guests will see first.
          </p>
        </div>
        <SaveButton saving={saving} className="sm:w-auto" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="order-2 min-w-0 space-y-5 lg:order-1">
          <Section title="Identity" text="The name and description already used on your menus.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Restaurant name" className="sm:col-span-2">
                <input
                  className={fieldClass}
                  value={data.name}
                  onChange={(event) => setField('name', event.target.value)}
                  placeholder="Raja Restaurant"
                  required
                  autoComplete="organization"
                />
              </Field>
              <Field label="Venue">
                <select
                  className={fieldClass}
                  value={data.venueType}
                  onChange={(event) => setField('venueType', event.target.value)}
                >
                  <option value="">Select a venue</option>
                  {VENUE_TYPES.map((venue) => (
                    <option key={venue} value={venue}>{venue}</option>
                  ))}
                  {data.venueType && !(VENUE_TYPES as readonly string[]).includes(data.venueType) ? (
                    <option value={data.venueType}>{data.venueType}</option>
                  ) : null}
                </select>
              </Field>
              <Field label="Cuisine">
                <input
                  className={fieldClass}
                  value={data.cuisine}
                  onChange={(event) => setField('cuisine', event.target.value)}
                  placeholder="South Indian, coffee, bakery"
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea
                  className={`${fieldClass} h-auto min-h-24 py-3`}
                  value={data.description}
                  onChange={(event) => setField('description', event.target.value)}
                  rows={3}
                  placeholder="A short line guests see at the top of the menu."
                />
              </Field>
              <Field
                label="Primary language"
                hint="Menus can offer more languages later. This is the restaurant default."
                className="sm:col-span-2"
              >
                <select
                  className={fieldClass}
                  value={data.language}
                  onChange={(event) => setField('language', event.target.value)}
                >
                  {LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>{language.label}</option>
                  ))}
                  {LANGUAGES.some((language) => language.code === data.language) ? null : (
                    <option value={data.language}>{data.language}</option>
                  )}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Contact" text="Numbers and links you can show with the menu later.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <input
                  className={fieldClass}
                  value={data.phone}
                  onChange={(event) => setField('phone', event.target.value)}
                  placeholder="+91 98765 43210"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  className={fieldClass}
                  value={data.whatsapp}
                  onChange={(event) => setField('whatsapp', event.target.value)}
                  placeholder="+91 98765 43210"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Email">
                <input
                  className={fieldClass}
                  type="email"
                  value={data.email}
                  onChange={(event) => setField('email', event.target.value)}
                  placeholder="hello@raja.example"
                  autoComplete="email"
                />
              </Field>
              <Field label="Instagram">
                <input
                  className={fieldClass}
                  value={data.instagram}
                  onChange={(event) => setField('instagram', event.target.value)}
                  placeholder="raja.restaurant"
                  autoComplete="off"
                />
              </Field>
              <Field label="Website" className="sm:col-span-2">
                <input
                  className={fieldClass}
                  value={data.website}
                  onChange={(event) => setField('website', event.target.value)}
                  placeholder="https://"
                  inputMode="url"
                  autoComplete="url"
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Address"
            text={
              india
                ? "A 6-digit PIN fills the city, district, and state from India Post. Every field stays editable."
                : "State and city lists load for the country you pick. You can still type them."
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Country">
                <select
                  className={fieldClass}
                  value={customCountry ? 'Other' : data.country || 'India'}
                  onChange={(event) => chooseCountry(event.target.value)}
                  autoComplete="country-name"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </Field>
              {customCountry ? (
                <Field label="Country name">
                  <input
                    className={fieldClass}
                    value={data.country}
                    onChange={(event) => setField('country', event.target.value)}
                    placeholder="Country"
                  />
                </Field>
              ) : (
                <Field label={india ? 'PIN code' : 'Postal code'}>
                  <div className="flex min-w-0 gap-2">
                    <input
                      className={fieldClass}
                      value={data.pincode}
                      onChange={(event) => {
                        const next = india
                          ? event.target.value.replace(/\D/g, '').slice(0, 6)
                          : event.target.value.slice(0, 12);
                        setField('pincode', next);
                      }}
                      placeholder={india ? '302001' : 'Postal code'}
                      inputMode={india ? 'numeric' : 'text'}
                      autoComplete="postal-code"
                    />
                    {india ? (
                      <button
                        type="button"
                        className="h-11 shrink-0 rounded-xl border border-[#E7DDD2] bg-[#F6F1EA] px-3 text-sm font-semibold text-[#1C1410] disabled:opacity-50"
                        onClick={() => void lookupPin(data.pincode, true)}
                        disabled={looking || data.pincode.length !== 6}
                      >
                        {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Find'}
                      </button>
                    ) : null}
                  </div>
                </Field>
              )}
              {customCountry ? (
                <Field label="Postal code" className="sm:col-span-2">
                  <input
                    className={fieldClass}
                    value={data.pincode}
                    onChange={(event) => setField('pincode', event.target.value.slice(0, 12))}
                    placeholder="Postal code"
                    autoComplete="postal-code"
                  />
                </Field>
              ) : null}
              {lookupNote ? (
                <p className="text-sm text-[#6B5A50] sm:col-span-2">{lookupNote}</p>
              ) : null}
              <Field label="Address line" className="sm:col-span-2">
                <input
                  className={fieldClass}
                  value={data.addressLine1}
                  onChange={(event) => setField('addressLine1', event.target.value)}
                  placeholder="Shop number, street, building"
                  autoComplete="address-line1"
                />
              </Field>
              <Field label="Area / locality" className="sm:col-span-2">
                <input
                  className={fieldClass}
                  value={data.addressLine2}
                  onChange={(event) => setField('addressLine2', event.target.value)}
                  placeholder="Neighbourhood or landmark"
                  list="profile-localities"
                  autoComplete="address-line2"
                />
                <datalist id="profile-localities">
                  {localities.map((locality) => (
                    <option key={locality} value={locality} />
                  ))}
                </datalist>
              </Field>
              <Field label="State">
                {states.length > 0 ? (
                  <select
                    className={fieldClass}
                    value={data.state}
                    onChange={(event) => {
                      const next = event.target.value;
                      setData((prev) => ({ ...prev, state: next, city: '' }));
                    }}
                  >
                    <option value="">{statesLoading ? 'Loading states…' : 'Select a state'}</option>
                    {stateOptions.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={fieldClass}
                    value={data.state}
                    onChange={(event) => setField('state', event.target.value)}
                    placeholder={statesLoading ? 'Loading states…' : 'State'}
                    autoComplete="address-level1"
                  />
                )}
              </Field>
              <Field label="City">
                <input
                  className={fieldClass}
                  value={data.city}
                  onChange={(event) => setField('city', event.target.value)}
                  placeholder="City"
                  list="profile-cities"
                  autoComplete="address-level2"
                />
                <datalist id="profile-cities">
                  {cities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </Field>
              <Field label={india ? 'District' : 'District / region'} className="sm:col-span-2">
                <input
                  className={fieldClass}
                  value={data.district}
                  onChange={(event) => setField('district', event.target.value)}
                  placeholder={india ? 'District' : 'Optional'}
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Opening hours"
            text="One sitting each day. A closing time earlier than opening is treated as after midnight."
            action={
              <button
                type="button"
                onClick={copyMonday}
                className="text-sm font-semibold text-[#C4622D]"
              >
                Use Monday for every day
              </button>
            }
          >
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#E7DDD2] bg-[#F6F1EA] px-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1C1410]">Show hours on the menu</p>
                <p className="mt-0.5 text-xs leading-5 text-[#6B5A50]">Turn this on when guests should see today, and the full week if they ask for it.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={data.showOpeningHours}
                aria-label="Show hours on the menu"
                onClick={() => setData((prev) => ({ ...prev, showOpeningHours: !prev.showOpeningHours }))}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${data.showOpeningHours ? 'bg-[#1C1410]' : 'bg-[#E7DDD2]'}`}
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${data.showOpeningHours ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="divide-y divide-[#F0E6DC]">
              {WEEKDAYS.map((day) => {
                const row = data.openingHours[day.key];
                const overnight = !row.closed && row.close <= row.open;
                return (
                  <div key={day.key} className="py-3 sm:flex sm:flex-nowrap sm:items-center sm:gap-x-3">
                    <div className="flex items-center justify-between gap-3 sm:contents">
                      <p className="text-sm font-medium text-[#1C1410] sm:w-28 sm:shrink-0">{day.label}</p>
                      <button
                        type="button"
                        onClick={() => setDay(day.key, { closed: !row.closed })}
                        className={`h-9 shrink-0 rounded-full px-3 text-xs font-semibold sm:order-last sm:ml-auto ${row.closed ? 'bg-[#F3E6DC] text-[#6B5A50]' : 'bg-[#1C1410] text-white'}`}
                      >
                        {row.closed ? 'Closed' : 'Open'}
                      </button>
                    </div>
                    {row.closed ? (
                      <p className="mt-2 text-sm text-[#8A776C] sm:mt-0">Closed all day</p>
                    ) : (
                      <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:mt-0 sm:flex sm:w-auto">
                        <input
                          type="time"
                          aria-label={`${day.label} opening time`}
                          className="h-10 w-full min-w-0 rounded-lg border border-[#E7DDD2] bg-white px-2 text-sm text-[#2A211C] [min-inline-size:0] sm:w-32"
                          value={row.open}
                          onChange={(event) => {
                            if (/^\d{2}:\d{2}$/.test(event.target.value)) setDay(day.key, { open: event.target.value });
                          }}
                        />
                        <span className="text-sm text-[#8A776C]">to</span>
                        <input
                          type="time"
                          aria-label={`${day.label} closing time`}
                          className="h-10 w-full min-w-0 rounded-lg border border-[#E7DDD2] bg-white px-2 text-sm text-[#2A211C] [min-inline-size:0] sm:w-32"
                          value={row.close}
                          onChange={(event) => {
                            if (/^\d{2}:\d{2}$/.test(event.target.value)) setDay(day.key, { close: event.target.value });
                          }}
                        />
                        {overnight ? <span className="col-span-3 text-xs text-[#8A776C] sm:col-span-1">After midnight</span> : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="contents lg:order-2 lg:flex lg:min-w-0 lg:flex-col lg:gap-5 lg:self-start">
        <div className="order-1 min-w-0">
          <section className="overflow-hidden rounded-2xl border border-[#E7DDD2] bg-white">
            <div className="relative h-36 bg-[#EFE6DC] sm:h-40">
              {data.coverImage ? (
                <img src={data.coverImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#B3A59B]">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleFileUpload(event, 'coverImage')}
                disabled={uploadingCover}
              />
              <label
                htmlFor="cover-upload"
                className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#1C1410] shadow-sm"
              >
                {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                Cover
              </label>
            </div>
            <div className="flex items-end gap-3 px-4 pb-4">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleFileUpload(event, 'logoUrl')}
                disabled={uploadingLogo}
              />
              <label
                htmlFor="logo-upload"
                className="-mt-8 flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#F6F1EA] text-[#8A776C] shadow-sm"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#C4622D]" />
                ) : data.logoUrl ? (
                  <img src={data.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Store className="h-6 w-6" />
                )}
              </label>
              <div className="min-w-0 pt-3">
                <p className="truncate text-sm font-semibold text-[#1C1410]">{data.name || 'Your restaurant'}</p>
                <p className="truncate text-xs text-[#6B5A50]">{placeLine || 'Logo and cover for your menus'}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="order-3 min-w-0 space-y-5">
          <Section title="Bills" text="Currency and tax already apply to guest orders.">
            <div className="grid gap-4">
              <Field label="Currency">
                <select
                  className={fieldClass}
                  value={data.currency}
                  onChange={(event) => setField('currency', event.target.value)}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tax name">
                  <input
                    className={fieldClass}
                    value={data.taxName}
                    onChange={(event) => setField('taxName', event.target.value)}
                    placeholder="GST"
                  />
                </Field>
                <Field label="Tax %">
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={data.taxRate}
                    onChange={(event) => setField('taxRate', event.target.value === '' ? 0 : Number(event.target.value))}
                  />
                </Field>
              </div>
            </div>
          </Section>

          {india ? (
            <Section title="Registrations" text="Stored on your account. They are not sent to the public menu.">
              <div className="grid gap-4">
                <Field label="GSTIN">
                  <input
                    className={`${fieldClass} uppercase`}
                    value={data.gstin}
                    onChange={(event) => setField('gstin', event.target.value.toUpperCase())}
                    placeholder="27AAAAA0000A1Z5"
                    maxLength={15}
                    spellCheck={false}
                  />
                </Field>
                <Field label="FSSAI">
                  <input
                    className={fieldClass}
                    value={data.fssai}
                    onChange={(event) => setField('fssai', event.target.value.replace(/\D/g, '').slice(0, 14))}
                    placeholder="14 digit licence"
                    inputMode="numeric"
                  />
                </Field>
              </div>
            </Section>
          ) : null}
        </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <SaveButton saving={saving} />
      </div>
    </form>
  );
}

function SaveButton({ saving, className = '' }: { saving: boolean; className?: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1C1410] px-5 text-sm font-semibold text-white disabled:opacity-70 ${className}`}
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Save profile
    </button>
  );
}

function Section({
  title,
  text,
  action,
  children,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E7DDD2] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#1C1410]">{title}</h2>
          {text ? <p className="mt-1 text-sm leading-6 text-[#6B5A50]">{text}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  className = '',
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-[#6B5A50]">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs leading-5 text-[#8A776C]">{hint}</span> : null}
    </label>
  );
}
