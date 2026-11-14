"use client";

import { restaurantService, uploadService } from "@/lib/api";
import type { MenuOfferType } from "@/lib/offers/types";
import { defaultRulesFor } from "@/lib/offers/rules";
import { toast } from "@/lib/toast";
import {
  BadgePercent,
  Clock3,
  Eye,
  Gift,
  ImagePlus,
  Loader2,
  Package,
  Pause,
  Pencil,
  Play,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type OfferRow = {
  id: number;
  type: MenuOfferType;
  status: "DRAFT" | "ACTIVE" | "PAUSED";
  title: string;
  subtitle: string | null;
  badgeLabel: string | null;
  imageUrl?: string | null;
  menuId: number | null;
  priority: number;
  startsAt: string | null;
  endsAt: string | null;
  schedule: { daysOfWeek?: number[]; windows?: { start: string; end: string }[] } | null;
  rules: any;
  presentation?: { emphasis?: "rail" | "hero" | "badge" } | null;
  targets: { kind: "ITEM" | "CATEGORY"; refId: number }[];
};

type MenuOption = { id: number; name: string };
type ItemOption = { id: number; name: string; price: number; categoryId: number; categoryName: string };

type TemplateId =
  | "percent_off"
  | "bogo"
  | "combo"
  | "under"
  | "special"
  | "happy_hour";

const TEMPLATES: {
  id: TemplateId;
  type: MenuOfferType;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  badge: string;
  happyHour?: boolean;
}[] = [
  {
    id: "percent_off",
    type: "ITEM_DISCOUNT",
    title: "% or ₹ off items",
    blurb: "Discount selected dishes on the menu.",
    icon: <BadgePercent className="h-5 w-5" />,
    badge: "Offer",
  },
  {
    id: "bogo",
    type: "BOGO",
    title: "Buy 1 Get 1",
    blurb: "Buy X, get Y free or cheaper.",
    icon: <Gift className="h-5 w-5" />,
    badge: "BOGO",
  },
  {
    id: "combo",
    type: "COMBO",
    title: "Combo meal",
    blurb: "Fixed price for a set of items.",
    icon: <Package className="h-5 w-5" />,
    badge: "Combo",
  },
  {
    id: "under",
    type: "COLLECTION",
    title: "Under ₹X",
    blurb: "Highlight everything under a price.",
    icon: <Tag className="h-5 w-5" />,
    badge: "Under",
  },
  {
    id: "special",
    type: "SPECIAL",
    title: "Festival / special",
    blurb: "Feature a thali or limited special.",
    icon: <Sparkles className="h-5 w-5" />,
    badge: "Special",
  },
  {
    id: "happy_hour",
    type: "ITEM_DISCOUNT",
    title: "Happy hour",
    blurb: "Time-window discount on items.",
    icon: <Clock3 className="h-5 w-5" />,
    badge: "Happy hour",
    happyHour: true,
  },
];

function statusTone(status: OfferRow["status"]) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (status === "PAUSED") return "bg-amber-50 text-amber-900 border-amber-200";
  return "bg-[#F3EBE3] text-[#6B5A50] border-[#E7DDD2]";
}

function templateIdForOffer(offer: OfferRow): TemplateId {
  if (offer.type === "BOGO") return "bogo";
  if (offer.type === "COMBO") return "combo";
  if (offer.type === "COLLECTION") return "under";
  if (offer.type === "SPECIAL") return "special";
  if (offer.type === "ITEM_DISCOUNT" && offer.schedule?.windows?.length) return "happy_hour";
  return "percent_off";
}

function formatWhen(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function RestaurantOffersPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [entitled, setEntitled] = useState(true);
  const [customAllowed, setCustomAllowed] = useState(false);
  const [menus, setMenus] = useState<MenuOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewOffer, setViewOffer] = useState<OfferRow | null>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [templateId, setTemplateId] = useState<TemplateId>("percent_off");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badgeLabel, setBadgeLabel] = useState("");
  const [menuId, setMenuId] = useState<string>("all");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [discountMode, setDiscountMode] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState("10");
  const [underPrice, setUnderPrice] = useState("199");
  const [packagePrice, setPackagePrice] = useState("199");
  const [comboSlotA, setComboSlotA] = useState<number[]>([]);
  const [comboSlotB, setComboSlotB] = useState<number[]>([]);
  const [comboSlotC, setComboSlotC] = useState<number[]>([]);
  const [windowStart, setWindowStart] = useState("16:00");
  const [windowEnd, setWindowEnd] = useState("20:00");
  const [publishActive, setPublishActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bogoSameItem, setBogoSameItem] = useState(false);

  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const isEditing = editingId != null;
  const wizardMinStep = isEditing ? 1 : 0;

  const itemsById = useMemo(() => {
    const map = new Map<number, ItemOption>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  const load = useCallback(async () => {
    try {
      const [offersRes, menusRes] = await Promise.all([
        restaurantService.listOffers(),
        restaurantService.listMenus(),
      ]);
      const offersJson = (offersRes.data || (await offersRes.json().catch(() => null))) as {
        offers?: OfferRow[];
        entitlements?: { offers?: boolean; custom?: boolean };
        error?: string;
      } | null;
      if (!offersRes.ok) throw new Error(offersJson?.error || "Could not load offers.");
      setOffers(offersJson?.offers || []);
      setEntitled(offersJson?.entitlements?.offers !== false);
      setCustomAllowed(Boolean(offersJson?.entitlements?.custom));

      const menusJson = (menusRes.data || (await menusRes.json().catch(() => null))) as {
        menus?: { id: number; name: string }[];
      } | null;
      const menuList = (menusJson?.menus || []).map((m) => ({ id: m.id, name: m.name }));
      setMenus(menuList);

      const itemRows: ItemOption[] = [];
      for (const menu of menuList.slice(0, 8)) {
        const menuRes = await restaurantService.getMenu(menu.id);
        const menuJson = (menuRes.data || (await menuRes.json().catch(() => null))) as {
          menu?: {
            categories?: {
              id: number;
              name: string;
              items?: { id: number; name: string; price: any }[];
            }[];
          };
        } | null;
        for (const cat of menuJson?.menu?.categories || []) {
          for (const item of cat.items || []) {
            itemRows.push({
              id: item.id,
              name: item.name,
              price: Number(item.price),
              categoryId: cat.id,
              categoryName: cat.name,
            });
          }
        }
      }
      setItems(itemRows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load offers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(() => items, [items]);

  function resetFormDefaults() {
    setTemplateId("percent_off");
    setTitle("");
    setSubtitle("");
    setBadgeLabel("");
    setMenuId("all");
    setSelectedItemIds([]);
    setDiscountMode("percent");
    setDiscountValue("10");
    setUnderPrice("199");
    setPackagePrice("199");
    setComboSlotA([]);
    setComboSlotB([]);
    setComboSlotC([]);
    setWindowStart("16:00");
    setWindowEnd("20:00");
    setPublishActive(true);
    setImageUrl(null);
    setBogoSameItem(false);
  }

  function openWizard() {
    setEditingId(null);
    setViewOffer(null);
    resetFormDefaults();
    setStep(0);
    setWizardOpen(true);
  }

  function populateFromOffer(offer: OfferRow) {
    const tid = templateIdForOffer(offer);
    setTemplateId(tid);
    setTitle(offer.title || "");
    setSubtitle(offer.subtitle || "");
    setBadgeLabel(offer.badgeLabel || "");
    setMenuId(offer.menuId == null ? "all" : String(offer.menuId));
    setPublishActive(offer.status === "ACTIVE");
    setImageUrl(offer.imageUrl || null);

    const targetItemIds = offer.targets.filter((t) => t.kind === "ITEM").map((t) => t.refId);
    const rules = offer.rules || {};

    if (offer.type === "ITEM_DISCOUNT") {
      setDiscountMode(rules.mode === "amount" ? "amount" : "percent");
      setDiscountValue(String(rules.value ?? 10));
      setSelectedItemIds(targetItemIds);
    } else if (offer.type === "BOGO") {
      setSelectedItemIds(targetItemIds);
      // Legacy multi-item BOGOs looked like sameItem but were meant as pools.
      if (targetItemIds.length > 1) {
        setBogoSameItem(rules.sameItem === true && Boolean(rules.sameItemStrict));
      } else {
        setBogoSameItem(true);
      }
    } else if (offer.type === "COMBO") {
      const slots = Array.isArray(rules.slots) ? rules.slots : [];
      setPackagePrice(String(rules.packagePrice ?? 199));
      setComboSlotA(Array.isArray(slots[0]?.itemIds) ? slots[0].itemIds.map(Number) : []);
      setComboSlotB(Array.isArray(slots[1]?.itemIds) ? slots[1].itemIds.map(Number) : []);
      setComboSlotC(Array.isArray(slots[2]?.itemIds) ? slots[2].itemIds.map(Number) : []);
      setSelectedItemIds(targetItemIds);
    } else if (offer.type === "COLLECTION") {
      setUnderPrice(String(rules.maxPrice ?? 199));
      setSelectedItemIds([]);
    } else if (offer.type === "SPECIAL") {
      const highlight = Array.isArray(rules.highlightItemIds)
        ? rules.highlightItemIds.map(Number)
        : targetItemIds;
      setSelectedItemIds(highlight);
    }

    const window = offer.schedule?.windows?.[0];
    setWindowStart(window?.start || "16:00");
    setWindowEnd(window?.end || "20:00");
  }

  function openEdit(offer: OfferRow) {
    setViewOffer(null);
    setEditingId(offer.id);
    populateFromOffer(offer);
    setStep(1);
    setWizardOpen(true);
  }

  function openView(offer: OfferRow) {
    setWizardOpen(false);
    setViewOffer(offer);
  }

  function closeWizard() {
    setWizardOpen(false);
    setEditingId(null);
  }

  function toggleId(list: number[], id: number) {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  function itemNames(ids: number[]) {
    return ids
      .map((id) => itemsById.get(id)?.name || `Item #${id}`)
      .join(", ");
  }

  function buildPayload() {
    const type = template.type;
    let rules: any = defaultRulesFor(type);
    let targets: { kind: "ITEM" | "CATEGORY"; refId: number }[] = selectedItemIds.map((refId) => ({
      kind: "ITEM",
      refId,
    }));
    let schedule: OfferRow["schedule"] = null;
    let presentation: { emphasis?: "rail" | "hero" | "badge" } = { emphasis: "rail" };

    if (type === "ITEM_DISCOUNT") {
      rules = { mode: discountMode, value: Number(discountValue) };
      if (!selectedItemIds.length) throw new Error("Pick at least one item.");
    } else if (type === "BOGO") {
      // Single dish → same item; multiple dishes respect the owner toggle (default mix & match).
      const sameItem = selectedItemIds.length <= 1 ? true : bogoSameItem;
      rules = {
        buyQty: 1,
        getQty: 1,
        getMode: "free",
        sameItem,
        ...(sameItem && selectedItemIds.length > 1 ? { sameItemStrict: true } : {}),
      };
      if (!selectedItemIds.length) throw new Error("Pick at least one item.");
    } else if (type === "COMBO") {
      if (comboSlotA.length < 1 || comboSlotB.length < 1) {
        throw new Error("Pick items for both combo slots.");
      }
      const slots = [
        { label: "Main", minQty: 1, itemIds: comboSlotA },
        { label: "Side / drink", minQty: 1, itemIds: comboSlotB },
      ];
      if (comboSlotC.length) {
        slots.push({ label: "Extra", minQty: 1, itemIds: comboSlotC });
      }
      rules = { packagePrice: Number(packagePrice), slots };
      targets = [...new Set([...comboSlotA, ...comboSlotB, ...comboSlotC])].map((refId) => ({
        kind: "ITEM" as const,
        refId,
      }));
      presentation = { emphasis: "hero" };
    } else if (type === "COLLECTION") {
      rules = { mode: "under_price", maxPrice: Number(underPrice) };
      targets = [];
    } else if (type === "SPECIAL") {
      rules = { highlightItemIds: selectedItemIds };
      targets = selectedItemIds.map((refId) => ({ kind: "ITEM" as const, refId }));
      presentation = { emphasis: "hero" };
    }

    if (template.happyHour) {
      schedule = { windows: [{ start: windowStart, end: windowEnd }] };
    }

    return {
      type,
      title: title.trim() || template.title,
      subtitle: subtitle.trim() || null,
      badgeLabel: badgeLabel.trim() || template.badge,
      imageUrl: imageUrl?.trim() || null,
      menuId: menuId === "all" ? null : Number(menuId),
      status: publishActive ? "ACTIVE" : isEditing ? "DRAFT" : "DRAFT",
      priority: 10,
      rules,
      targets,
      schedule,
      presentation,
    };
  }

  async function onOfferImage(file: File | null) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 2MB.");
      return;
    }
    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await uploadService.file(uploadData);
      const json = (res.data || (await res.json().catch(() => null))) as { url?: string; error?: string } | null;
      if (!res.ok || !json?.url) throw new Error(json?.error || "Upload failed.");
      setImageUrl(json.url);
      toast.success("Offer image added.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveOffer() {
    if (!entitled) {
      toast.error("Offers are not on your current plan.");
      return;
    }
    if (template.happyHour && !customAllowed) {
      toast.error("Timed happy-hour windows need a plan with custom discounts.");
      return;
    }

    setSaving(true);
    try {
      const body = buildPayload();
      if (isEditing) {
        // Keep paused/draft intentional when editing an inactive offer unless publishing.
        const current = offers.find((o) => o.id === editingId);
        if (current && !publishActive) {
          body.status = current.status === "ACTIVE" ? "DRAFT" : current.status;
        }
        const res = await restaurantService.updateOffer(editingId!, body);
        const json = (res.data || (await res.json().catch(() => null))) as {
          error?: string;
          message?: string;
        } | null;
        if (!res.ok) throw new Error(json?.message || json?.error || "Could not update offer.");
        toast.success(publishActive ? "Offer updated and live." : "Offer updated.");
      } else {
        const res = await restaurantService.createOffer(body);
        const json = (res.data || (await res.json().catch(() => null))) as {
          error?: string;
          message?: string;
        } | null;
        if (!res.ok) throw new Error(json?.message || json?.error || "Could not create offer.");
        toast.success(publishActive ? "Offer is live on your menu." : "Offer saved as draft.");
      }
      closeWizard();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save offer.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(offer: OfferRow, status: OfferRow["status"]) {
    setBusyId(offer.id);
    try {
      const res = await restaurantService.updateOffer(offer.id, { status });
      if (!res.ok) {
        const json = (res.data || (await res.json().catch(() => null))) as { message?: string; error?: string } | null;
        throw new Error(json?.message || json?.error || "Update failed.");
      }
      toast.success(status === "ACTIVE" ? "Offer live." : status === "PAUSED" ? "Offer paused." : "Saved.");
      await load();
      if (viewOffer?.id === offer.id) {
        setViewOffer({ ...offer, status });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeOffer(offer: OfferRow) {
    if (!confirm(`Delete “${offer.title}”?`)) return;
    setBusyId(offer.id);
    try {
      const res = await restaurantService.deleteOffer(offer.id);
      if (!res.ok) throw new Error("Delete failed.");
      toast.success("Offer deleted.");
      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
      if (viewOffer?.id === offer.id) setViewOffer(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  function renderOfferDetails(offer: OfferRow) {
    const rules = offer.rules || {};
    const menuName =
      offer.menuId == null
        ? "All menus"
        : menus.find((m) => m.id === offer.menuId)?.name || `Menu #${offer.menuId}`;
    const targetIds = offer.targets.filter((t) => t.kind === "ITEM").map((t) => t.refId);
    const window = offer.schedule?.windows?.[0];

    return (
      <div className="space-y-4 text-sm">
        <div className="rounded-2xl border border-[#E7DDD2] bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4622D]">
            {offer.badgeLabel || offer.type.replace("_", " ")}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#1C1410]">{offer.title}</h3>
          {offer.subtitle ? <p className="mt-1 text-[#6B5A50]">{offer.subtitle}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(offer.status)}`}>
              {offer.status}
            </span>
            <span className="rounded-full bg-[#F6F1EA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B5A50]">
              {offer.type.replace("_", " ")}
            </span>
          </div>
        </div>

        <DetailRow label="Menu" value={menuName} />
        <DetailRow label="Priority" value={String(offer.priority)} />

        {offer.type === "ITEM_DISCOUNT" ? (
          <DetailRow
            label="Discount"
            value={
              rules.mode === "amount"
                ? `₹${rules.value} off`
                : `${rules.value}% off`
            }
          />
        ) : null}

        {offer.type === "BOGO" ? (
          <>
            <DetailRow
              label="Deal"
              value={`Buy ${rules.buyQty || 1}, get ${rules.getQty || 1} ${
                rules.getMode === "free" ? "free" : `${rules.getValue}${rules.getMode === "percent" ? "%" : "₹"} off`
              }`}
            />
            <DetailRow
              label="Applies to"
              value={rules.sameItem === true ? "Same dish only" : "Any selected dish (mix & match)"}
            />
          </>
        ) : null}

        {offer.imageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-[#E7DDD2] bg-white">
            <p className="border-b border-[#E7DDD2] px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#6B5A50]">
              Promo image
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={offer.imageUrl} alt="" className="h-44 w-full object-cover" />
          </div>
        ) : null}

        {offer.type === "COMBO" ? (
          <>
            <DetailRow label="Package price" value={`₹${rules.packagePrice}`} />
            {Array.isArray(rules.slots)
              ? rules.slots.map((slot: { label?: string; itemIds?: number[] }, idx: number) => (
                  <DetailRow
                    key={`${slot.label}-${idx}`}
                    label={slot.label || `Slot ${idx + 1}`}
                    value={itemNames((slot.itemIds || []).map(Number)) || "—"}
                  />
                ))
              : null}
          </>
        ) : null}

        {offer.type === "COLLECTION" ? (
          <DetailRow
            label="Collection"
            value={
              rules.mode === "under_price"
                ? `Items under ₹${rules.maxPrice}`
                : "Curated list"
            }
          />
        ) : null}

        {offer.type === "SPECIAL" ? (
          <DetailRow
            label="Highlighted items"
            value={itemNames(
              (Array.isArray(rules.highlightItemIds) ? rules.highlightItemIds : targetIds).map(Number),
            ) || "—"}
          />
        ) : null}

        {(offer.type === "ITEM_DISCOUNT" || offer.type === "BOGO") && targetIds.length ? (
          <DetailRow label="Items" value={itemNames(targetIds)} />
        ) : null}

        {window ? (
          <DetailRow label="Time window" value={`${window.start} – ${window.end}`} />
        ) : null}
        {offer.startsAt ? <DetailRow label="Starts" value={formatWhen(offer.startsAt) || "—"} /> : null}
        {offer.endsAt ? <DetailRow label="Ends" value={formatWhen(offer.endsAt) || "—"} /> : null}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[#6B5A50]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4622D]">Promotions</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410]">Offers</h1>
          <p className="mt-1 max-w-xl text-sm text-[#6B5A50]">
            Run combos, BOGO, festival specials, and timed discounts. Guests see them highlighted on every menu theme.
          </p>
        </div>
        <button
          type="button"
          onClick={openWizard}
          disabled={!entitled}
          className="inline-flex items-center gap-2 rounded-full bg-[#C4622D] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New offer
        </button>
      </div>

      {!entitled ? (
        <div className="rounded-2xl border border-[#E7DDD2] bg-white px-5 py-4 text-sm text-[#6B5A50]">
          Offers are available on Starter and Growth.{" "}
          <Link href="/dashboard/restaurant/billing" className="font-semibold text-[#C4622D]">
            View plans
          </Link>
        </div>
      ) : null}

      {!offers.length ? (
        <div className="rounded-3xl border border-dashed border-[#E0D4C8] bg-white/70 px-6 py-14 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-[#C4622D]" />
          <h2 className="mt-3 text-lg font-semibold text-[#1C1410]">No offers yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#6B5A50]">
            Start with a template — Buy 1 Get 1, a combo at a set price, Under ₹199, or a happy-hour window.
          </p>
          <button
            type="button"
            onClick={openWizard}
            disabled={!entitled}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1C1410] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create your first offer
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E7DDD2] bg-white px-4 py-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[#1C1410]">{offer.title}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(offer.status)}`}>
                    {offer.status}
                  </span>
                  <span className="rounded-full bg-[#F6F1EA] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B5A50]">
                    {offer.type.replace("_", " ")}
                  </span>
                </div>
                {offer.subtitle ? <p className="mt-1 text-xs text-[#6B5A50]">{offer.subtitle}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openView(offer)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E7DDD2] px-3 py-1.5 text-xs font-semibold text-[#1C1410]"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button
                  type="button"
                  disabled={!entitled}
                  onClick={() => openEdit(offer)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E7DDD2] px-3 py-1.5 text-xs font-semibold text-[#1C1410] disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {offer.status === "ACTIVE" ? (
                  <button
                    type="button"
                    disabled={busyId === offer.id}
                    onClick={() => void setStatus(offer, "PAUSED")}
                    className="inline-flex items-center gap-1 rounded-full border border-[#E7DDD2] px-3 py-1.5 text-xs font-semibold text-[#1C1410]"
                  >
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === offer.id}
                    onClick={() => void setStatus(offer, "ACTIVE")}
                    className="inline-flex items-center gap-1 rounded-full border border-[#E7DDD2] px-3 py-1.5 text-xs font-semibold text-[#1C1410]"
                  >
                    <Play className="h-3.5 w-3.5" /> Go live
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === offer.id}
                  onClick={() => void removeOffer(offer)}
                  aria-label={`Delete ${offer.title}`}
                  className="inline-flex items-center gap-1 rounded-full border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewOffer ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#F6F1EA] sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E7DDD2] bg-[#F6F1EA]/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C4622D]">Offer details</p>
                <h2 className="text-lg font-semibold text-[#1C1410]">View offer</h2>
              </div>
              <button type="button" onClick={() => setViewOffer(null)} className="rounded-full p-2 text-[#6B5A50]" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 px-5 py-5">
              {renderOfferDetails(viewOffer)}
            </div>
            <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[#E7DDD2] bg-[#F6F1EA] px-5 py-4">
              <button
                type="button"
                onClick={() => setViewOffer(null)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#6B5A50]"
              >
                Close
              </button>
              <button
                type="button"
                disabled={!entitled}
                onClick={() => openEdit(viewOffer)}
                className="inline-flex items-center gap-2 rounded-full bg-[#C4622D] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Pencil className="h-4 w-4" />
                Edit offer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {wizardOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-[#F6F1EA] sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E7DDD2] bg-[#F6F1EA]/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C4622D]">
                  {isEditing ? "Edit offer" : `Step ${step + 1} of 4`}
                </p>
                <h2 className="text-lg font-semibold text-[#1C1410]">
                  {isEditing ? title || "Edit offer" : "New offer"}
                </h2>
              </div>
              <button type="button" onClick={closeWizard} className="rounded-full p-2 text-[#6B5A50]" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              {step === 0 && !isEditing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTemplateId(t.id);
                        setBadgeLabel(t.badge);
                        if (!title) setTitle(t.title);
                      }}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        templateId === t.id
                          ? "border-[#C4622D] bg-white shadow-sm"
                          : "border-[#E7DDD2] bg-white/70"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[#C4622D]">
                        {t.icon}
                        <span className="text-sm font-semibold text-[#1C1410]">{t.title}</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#6B5A50]">{t.blurb}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-3">
                  {isEditing ? (
                    <p className="rounded-xl border border-[#E7DDD2] bg-white px-3 py-2 text-xs text-[#6B5A50]">
                      Type: <span className="font-semibold text-[#1C1410]">{template.type.replace("_", " ")}</span>
                      {template.happyHour ? " · Happy hour schedule" : ""}
                    </p>
                  ) : null}
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[#1C1410]">Title</span>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5 text-sm"
                      placeholder="Weekend combo"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[#1C1410]">Subtitle</span>
                    <input
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5 text-sm"
                      placeholder="Short line guests see on the card"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[#1C1410]">Badge</span>
                    <input
                      value={badgeLabel}
                      onChange={(e) => setBadgeLabel(e.target.value)}
                      className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5 text-sm"
                      maxLength={24}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[#1C1410]">Menu</span>
                    <select
                      value={menuId}
                      onChange={(e) => setMenuId(e.target.value)}
                      className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="all">All menus</option>
                      {menus.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-2xl border border-[#E7DDD2] bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#1C1410]">Promo image</p>
                        <p className="mt-0.5 text-xs text-[#6B5A50]">Optional. Guests see it on the offer card.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {imageUrl ? (
                          <button
                            type="button"
                            onClick={() => setImageUrl(null)}
                            className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-700"
                          >
                            Remove
                          </button>
                        ) : null}
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#E7DDD2] px-3 py-1.5 text-xs font-semibold text-[#1C1410]">
                          {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                          {imageUrl ? "Replace" : "Upload"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            disabled={uploadingImage}
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              e.target.value = "";
                              void onOfferImage(file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    {imageUrl ? (
                      <div className="mt-3 overflow-hidden rounded-xl border border-[#E7DDD2]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="" className="h-36 w-full object-cover" />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-4">
                  {template.type === "ITEM_DISCOUNT" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm">
                        <span className="mb-1 block font-medium">Mode</span>
                        <select
                          value={discountMode}
                          onChange={(e) => setDiscountMode(e.target.value as "percent" | "amount")}
                          className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5"
                        >
                          <option value="percent">Percent %</option>
                          <option value="amount">Amount ₹</option>
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block font-medium">Value</span>
                        <input
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          type="number"
                          min={1}
                          className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5"
                        />
                      </label>
                    </div>
                  ) : null}

                  {template.type === "COLLECTION" ? (
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">Under price (₹)</span>
                      <input
                        value={underPrice}
                        onChange={(e) => setUnderPrice(e.target.value)}
                        type="number"
                        min={1}
                        className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5"
                      />
                    </label>
                  ) : null}

                  {template.type === "BOGO" ? (
                    <label className="flex items-start gap-3 rounded-2xl border border-[#E7DDD2] bg-white px-4 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={bogoSameItem}
                        onChange={(e) => setBogoSameItem(e.target.checked)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <span>
                        <span className="block font-medium text-[#1C1410]">Same dish only</span>
                        <span className="mt-0.5 block text-xs text-[#6B5A50]">
                          Off = guest can mix any selected dishes (Buy Cappuccino, get Cold Coffee free). On = must buy two of the same dish.
                        </span>
                      </span>
                    </label>
                  ) : null}

                  {template.type === "COMBO" ? (
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">Package price (₹)</span>
                      <input
                        value={packagePrice}
                        onChange={(e) => setPackagePrice(e.target.value)}
                        type="number"
                        min={0}
                        className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5"
                      />
                    </label>
                  ) : null}

                  {template.happyHour ? (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm">
                        <span className="mb-1 block font-medium">From</span>
                        <input
                          type="time"
                          value={windowStart}
                          onChange={(e) => setWindowStart(e.target.value)}
                          className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5"
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block font-medium">To</span>
                        <input
                          type="time"
                          value={windowEnd}
                          onChange={(e) => setWindowEnd(e.target.value)}
                          className="w-full rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5"
                        />
                      </label>
                    </div>
                  ) : null}

                  {template.type !== "COLLECTION" ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-[#1C1410]">
                        {template.type === "COMBO" ? "Combo slots" : "Items"}
                      </p>
                      {template.type === "COMBO" ? (
                        <div className="space-y-3">
                          <ItemPicker
                            label="Slot A — mains"
                            items={filteredItems}
                            selected={comboSlotA}
                            onToggle={(id) => setComboSlotA((prev) => toggleId(prev, id))}
                          />
                          <ItemPicker
                            label="Slot B — sides / drinks"
                            items={filteredItems}
                            selected={comboSlotB}
                            onToggle={(id) => setComboSlotB((prev) => toggleId(prev, id))}
                          />
                          {(comboSlotC.length > 0 || isEditing) ? (
                            <ItemPicker
                              label="Slot C — extra (optional)"
                              items={filteredItems}
                              selected={comboSlotC}
                              onToggle={(id) => setComboSlotC((prev) => toggleId(prev, id))}
                            />
                          ) : null}
                        </div>
                      ) : (
                        <ItemPicker
                          label="Select dishes"
                          items={filteredItems}
                          selected={selectedItemIds}
                          onToggle={(id) => setSelectedItemIds((prev) => toggleId(prev, id))}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B5A50]">
                      Items priced at or under ₹{underPrice || "…"} will appear in this strip automatically.
                    </p>
                  )}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#E7DDD2] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4622D]">
                      {badgeLabel || template.badge}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-[#1C1410]">{title || template.title}</h3>
                    {subtitle ? <p className="mt-1 text-sm text-[#6B5A50]">{subtitle}</p> : null}
                    <p className="mt-3 text-xs text-[#6B5A50]">
                      Type: {template.type.replace("_", " ")}
                      {template.happyHour ? ` · ${windowStart}–${windowEnd}` : ""}
                    </p>
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-[#E7DDD2] bg-white px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={publishActive}
                      onChange={(e) => setPublishActive(e.target.checked)}
                      className="h-4 w-4"
                    />
                    {isEditing ? "Keep / set live on the guest menu" : "Publish live on the guest menu now"}
                  </label>
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[#E7DDD2] bg-[#F6F1EA] px-5 py-4">
              <button
                type="button"
                disabled={step <= wizardMinStep}
                onClick={() => setStep((s) => Math.max(wizardMinStep, s - 1))}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#6B5A50] disabled:opacity-40"
              >
                Back
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  className="rounded-full bg-[#1C1410] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveOffer()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C4622D] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isEditing
                    ? publishActive
                      ? "Save & go live"
                      : "Save changes"
                    : publishActive
                      ? "Publish offer"
                      : "Save draft"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E7DDD2] bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B5A50]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#1C1410] wrap-anywhere">{value}</p>
    </div>
  );
}

function ItemPicker({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: ItemOption[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#E7DDD2] bg-white">
      <p className="border-b border-[#E7DDD2] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#6B5A50]">
        {label} · {selected.length} selected
      </p>
      <div className="max-h-48 overflow-y-auto p-2">
        {!items.length ? (
          <p className="px-2 py-3 text-xs text-[#6B5A50]">Add dishes on the Menus page first.</p>
        ) : (
          items.map((item) => {
            const on = selected.includes(item.id);
            return (
              <button
                key={`${label}-${item.id}`}
                type="button"
                onClick={() => onToggle(item.id)}
                className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                  on ? "bg-[#C4622D]/10 text-[#1C1410]" : "hover:bg-[#F6F1EA]"
                }`}
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-2 text-xs text-[#6B5A50]">{item.categoryName}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold">₹{item.price}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
