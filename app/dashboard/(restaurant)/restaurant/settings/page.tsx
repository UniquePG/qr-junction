"use client";

import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import MenuLanguagesPanel from "@/components/restaurant/MenuLanguagesPanel";
import { useOrderAlerts } from "@/components/orders/OrderAlerts";
import { restaurantService } from "@/lib/api";
import { Bell, FileText, KeyRound, Languages, Loader2, ShoppingBag, Volume2 } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from '@/lib/toast';

type SettingsState = {
  digitalBill: boolean;
  orderSound: boolean;
  acceptingOrders: boolean;
};

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  busy,
  onChange,
  hint,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  busy?: boolean;
  onChange: (next: boolean) => void;
  hint?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-[#E7DDD2] bg-white px-4 py-4 ${disabled ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1C1410]">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#6B5A50]">{description}</p>
          {hint ? <div className="mt-2 text-xs text-[#C4622D]">{hint}</div> : null}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled || busy}
          onClick={() => onChange(!checked)}
          className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full border-none transition disabled:cursor-not-allowed ${
            checked ? "bg-[#C4622D]" : "bg-[#D4C4B5]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              checked ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function RestaurantSettingsPage() {
  const { soundReady, enableSound, setOrderSoundPreferred } = useOrderAlerts();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsState>({
    digitalBill: false,
    orderSound: false,
    acceptingOrders: true,
  });
  const [digitalBillAllowed, setDigitalBillAllowed] = useState(false);
  const [canManageAcceptingOrders, setCanManageAcceptingOrders] = useState(false);
  const [orderingUnlocked, setOrderingUnlocked] = useState(false);
  const [orderingAllowed, setOrderingAllowed] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const applySettingsResponse = (data: {
    settings?: Partial<SettingsState>;
    entitlements?: { digitalBill?: boolean; ordering?: boolean };
    capabilities?: {
      orderingUnlocked?: boolean;
      canManageAcceptingOrders?: boolean;
    };
  }) => {
    setSettings({
      digitalBill: Boolean(data.settings?.digitalBill),
      orderSound: Boolean(data.settings?.orderSound),
      acceptingOrders: data.settings?.acceptingOrders !== false,
    });
    setDigitalBillAllowed(Boolean(data.entitlements?.digitalBill));
    setOrderingAllowed(Boolean(data.entitlements?.ordering));
    setOrderingUnlocked(Boolean(data.capabilities?.orderingUnlocked));
    setCanManageAcceptingOrders(Boolean(data.capabilities?.canManageAcceptingOrders));
  };

  const load = useCallback(async () => {
    try {
      const res = await restaurantService.getSettings();
      if (!res.ok) {
        const body = res.data as { error?: string };
        throw new Error(body?.error || "Failed to load settings");
      }
      applySettingsResponse(res.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (partial: Partial<SettingsState>) => {
    const key = Object.keys(partial)[0] || "settings";
    setBusyKey(key);
    const previous = settings;
    setSettings((current) => ({ ...current, ...partial }));
    try {
      const res = await restaurantService.patchSettings(partial);
      if (!res.ok) {
        setSettings(previous);
        const body = res.data as { error?: string };
        throw new Error(body?.error || "Could not save setting");
      }
      applySettingsResponse(res.data);
      if (typeof partial.orderSound === "boolean") {
        setOrderSoundPreferred(partial.orderSound);
        if (partial.orderSound) {
          // Same click that toggled the switch — unlock autoplay for this browser tab.
          enableSound();
        }
      }
      toast.success("Setting saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save setting");
    } finally {
      setBusyKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in overflow-x-clip pb-24 md:pb-12">
      <div className="mb-6 sm:mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C4622D]">Restaurant</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410] sm:text-3xl">Settings</h1>
        <p className="mt-1 max-w-xl text-sm text-[#6B5A50]">
          Manage guest languages, kitchen alerts, order acceptance, and digital bills.
        </p>
      </div>

      <section className="space-y-3">
        <div className="mb-1 flex items-center gap-2 px-1">
          <ShoppingBag className="h-4 w-4 text-[#C4622D]" />
          <h2 className="text-sm font-semibold text-[#1C1410]">Live ordering</h2>
        </div>
        <ToggleRow
          title="Accept orders from menu"
          description="When off, guests can browse the menu but cannot add dishes or send plates. Use this on off days or when the kitchen is closed."
          checked={canManageAcceptingOrders ? settings.acceptingOrders : false}
          disabled={!canManageAcceptingOrders}
          busy={busyKey === "acceptingOrders"}
          onChange={(next) => void patch({ acceptingOrders: next })}
          hint={
            !canManageAcceptingOrders ? (
              !orderingAllowed ? (
                <span>
                  Live ordering is not on your plan.{" "}
                  <Link href="/dashboard/restaurant/billing" className="font-semibold text-[#C4622D]">
                    View plan
                  </Link>
                </span>
              ) : !orderingUnlocked ? (
                <span>Ordering is not unlocked for this restaurant yet. Ask support or an admin to turn it on.</span>
              ) : null
            ) : null
          }
        />
      </section>

      <section className="mt-8 space-y-3">
        <div className="mb-1 flex items-center gap-2 px-1">
          <Bell className="h-4 w-4 text-[#C4622D]" />
          <h2 className="text-sm font-semibold text-[#1C1410]">Kitchen alerts</h2>
        </div>
        <ToggleRow
          title="Order sound on new plates"
          description="Play a chime when a guest sends a new plate to the kitchen."
          checked={settings.orderSound}
          busy={busyKey === "orderSound"}
          onChange={(next) => void patch({ orderSound: next })}
          hint={
            settings.orderSound && !soundReady ? (
              <button
                type="button"
                onClick={() => enableSound()}
                className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 font-semibold text-[#C4622D] underline underline-offset-2"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Tap to unlock sound in this browser
              </button>
            ) : null
          }
        />
      </section>

      <section className="mt-8 space-y-3">
        <div className="mb-1 flex items-center gap-2 px-1">
          <FileText className="h-4 w-4 text-[#C4622D]" />
          <h2 className="text-sm font-semibold text-[#1C1410]">Billing</h2>
        </div>
        <ToggleRow
          title="Bill / invoice receipts"
          description="Let staff print bills from Payments and let paid guests download a PDF receipt."
          checked={digitalBillAllowed ? settings.digitalBill : false}
          disabled={!digitalBillAllowed}
          busy={busyKey === "digitalBill"}
          onChange={(next) => void patch({ digitalBill: next })}
          hint={
            !digitalBillAllowed ? (
              <span>
                Included on Growth.{" "}
                <Link href="/dashboard/restaurant/billing" className="font-semibold text-[#C4622D]">
                  Upgrade plan
                </Link>
              </span>
            ) : null
          }
        />
      </section>

      <section className="mt-8 space-y-3">
        <div className="mb-1 flex items-center gap-2 px-1">
          <Languages className="h-4 w-4 text-[#C4622D]" />
          <h2 className="text-sm font-semibold text-[#1C1410]">Guest menu languages</h2>
        </div>
        <MenuLanguagesPanel />
      </section>

      <section className="mt-8 space-y-3">
        <div className="mb-1 flex items-center gap-2 px-1">
          <KeyRound className="h-4 w-4 text-[#C4622D]" />
          <h2 className="text-sm font-semibold text-[#1C1410]">Account security</h2>
        </div>
        <ChangePasswordForm tone="suite" />
      </section>
    </div>
  );
}
