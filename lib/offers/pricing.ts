import type {
  BogoRules,
  ComboRules,
  ItemDiscountRules,
  MenuOfferType,
  OfferApplied,
} from "./types";

export type PricingLineIn = {
  menuItemId: number;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
};

export type PricingLineOut = PricingLineIn & {
  listUnitPrice: number;
  lineTotal: number;
  offerIds: number[];
};

export type OfferForPricing = {
  id: number;
  type: MenuOfferType;
  title: string;
  priority: number;
  itemIds: number[];
  rules: unknown;
};

export type OfferPricingResult = {
  lines: PricingLineOut[];
  discount: number;
  offersApplied: OfferApplied[];
  /** Subtotal after discounts (sum of charged line totals). */
  subtotal: number;
};

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function asItemDiscount(rules: unknown): ItemDiscountRules | null {
  if (!rules || typeof rules !== "object") return null;
  const r = rules as ItemDiscountRules;
  if (r.mode !== "percent" && r.mode !== "amount") return null;
  if (!Number.isFinite(r.value) || r.value <= 0) return null;
  return r;
}

function asBogo(rules: unknown): BogoRules | null {
  if (!rules || typeof rules !== "object") return null;
  const r = rules as BogoRules;
  if (!Number.isFinite(r.buyQty) || !Number.isFinite(r.getQty)) return null;
  if (r.getMode !== "free" && r.getMode !== "percent" && r.getMode !== "amount") return null;
  return r;
}

function asCombo(rules: unknown): ComboRules | null {
  if (!rules || typeof rules !== "object") return null;
  const r = rules as ComboRules;
  if (!Array.isArray(r.slots) || r.slots.length < 2) return null;
  if (!Number.isFinite(r.packagePrice) || r.packagePrice < 0) return null;
  return r;
}

function discountUnit(list: number, rules: ItemDiscountRules): number {
  let off = rules.mode === "percent" ? (list * rules.value) / 100 : rules.value;
  if (rules.maxDiscountPerItem != null && rules.maxDiscountPerItem > 0) {
    off = Math.min(off, rules.maxDiscountPerItem);
  }
  return money(Math.max(0, list - off));
}

function bogoUnitForGet(list: number, rules: BogoRules): number {
  if (rules.getMode === "free") return 0;
  if (rules.getMode === "percent") {
    const off = (list * (rules.getValue || 0)) / 100;
    return money(Math.max(0, list - off));
  }
  return money(Math.max(0, list - (rules.getValue || 0)));
}

/**
 * Apply offers to priced lines.
 * Stacking: at most one ITEM_DISCOUNT per line (highest priority).
 * Then COMBO packages (consume matching lines), then BOGO on remaining qty.
 */
export function applyOfferPricing(
  linesIn: PricingLineIn[],
  offers: OfferForPricing[],
): OfferPricingResult {
  const sorted = [...offers].sort((a, b) => b.priority - a.priority || a.id - b.id);
  const itemDiscountOffers = sorted.filter((o) => o.type === "ITEM_DISCOUNT");
  const comboOffers = sorted.filter((o) => o.type === "COMBO");
  const bogoOffers = sorted.filter((o) => o.type === "BOGO");

  type Work = PricingLineOut & { remaining: number; charged: number };
  const work: Work[] = linesIn.map((line) => {
    const listUnitPrice = money(line.unitPrice);
    let unitPrice = listUnitPrice;
    const offerIds: number[] = [];

    const itemIds = new Set<number>();
    for (const offer of itemDiscountOffers) {
      for (const id of offer.itemIds) itemIds.add(id);
    }
    const winner = itemDiscountOffers.find((o) => o.itemIds.includes(line.menuItemId));
    if (winner) {
      const rules = asItemDiscount(winner.rules);
      if (rules) {
        unitPrice = discountUnit(listUnitPrice, rules);
        if (unitPrice < listUnitPrice) offerIds.push(winner.id);
      }
    } else if (itemIds.size === 0) {
      // no-op
    }

    return {
      ...line,
      unitPrice,
      listUnitPrice,
      lineTotal: 0,
      offerIds,
      remaining: line.quantity,
      charged: 0,
    };
  });

  const offersApplied: OfferApplied[] = [];
  const discountByOffer = new Map<number, OfferApplied>();

  function addApplied(offer: OfferForPricing, amount: number) {
    if (amount <= 0) return;
    const prev = discountByOffer.get(offer.id);
    if (prev) {
      prev.amount = money(prev.amount + amount);
    } else {
      discountByOffer.set(offer.id, {
        offerId: offer.id,
        type: offer.type,
        title: offer.title,
        amount: money(amount),
      });
    }
  }

  // COMBO: greedily match packages
  for (const offer of comboOffers) {
    const rules = asCombo(offer.rules);
    if (!rules) continue;
    let safety = 0;
    while (safety++ < 40) {
      const picked: { idx: number; qty: number }[] = [];
      let ok = true;
      for (const slot of rules.slots) {
        let need = slot.minQty;
        const slotPicks: { idx: number; qty: number }[] = [];
        for (let i = 0; i < work.length && need > 0; i += 1) {
          const line = work[i];
          if (!slot.itemIds.includes(line.menuItemId) || line.remaining <= 0) continue;
          const take = Math.min(need, line.remaining);
          slotPicks.push({ idx: i, qty: take });
          need -= take;
        }
        if (need > 0) {
          ok = false;
          break;
        }
        picked.push(...slotPicks);
      }
      if (!ok) break;

      let listSum = 0;
      for (const p of picked) {
        const line = work[p.idx];
        listSum += line.listUnitPrice * p.qty;
        line.remaining -= p.qty;
        if (!line.offerIds.includes(offer.id)) line.offerIds.push(offer.id);
      }
      const packageCharge = money(rules.packagePrice);
      const savings = money(Math.max(0, listSum - packageCharge));
      // Distribute package charge proportionally across picked units for unitPrice snapshot
      const totalUnits = picked.reduce((s, p) => s + p.qty, 0);
      let assigned = 0;
      picked.forEach((p, pi) => {
        const line = work[p.idx];
        const share =
          pi === picked.length - 1
            ? money(packageCharge - assigned)
            : money((packageCharge * p.qty) / totalUnits);
        assigned = money(assigned + share);
        line.charged = money(line.charged + share);
      });
      addApplied(offer, savings);
    }
  }

  // BOGO on remaining quantities (same-item pool by default)
  for (const offer of bogoOffers) {
    const rules = asBogo(offer.rules);
    if (!rules) continue;
    const poolIdx = work
      .map((line, idx) => ({ line, idx }))
      .filter(({ line }) => offer.itemIds.includes(line.menuItemId) && line.remaining > 0);

    if (rules.sameItem) {
      for (const { line, idx } of poolIdx) {
        void idx;
        const group = rules.buyQty + rules.getQty;
        if (group < 2) continue;
        const sets = Math.floor(line.remaining / group);
        if (sets < 1) continue;
        const getUnits = sets * rules.getQty;
        const buyUnits = sets * rules.buyQty;
        const getPrice = bogoUnitForGet(line.listUnitPrice, rules);
        const listForGet = money(line.listUnitPrice * getUnits);
        const chargeForGet = money(getPrice * getUnits);
        const savings = money(listForGet - chargeForGet);
        line.charged = money(line.charged + line.listUnitPrice * buyUnits + chargeForGet);
        line.remaining -= buyUnits + getUnits;
        if (!line.offerIds.includes(offer.id)) line.offerIds.push(offer.id);
        addApplied(offer, savings);
      }
    } else {
      // Cross-item pool: pay for the higher-value units, discount the cheaper
      // ones (equal-or-lesser value — same rule as Swiggy/Zomato-style BOGO).
      let safety = 0;
      while (safety++ < 40) {
        const available = poolIdx.filter(({ line }) => line.remaining > 0);
        const totalRemaining = available.reduce((s, x) => s + x.line.remaining, 0);
        const need = rules.buyQty + rules.getQty;
        if (totalRemaining < need) break;

        // buyQty = most expensive paid; getQty = cheapest discounted/free
        const units: { idx: number; list: number }[] = [];
        for (const { line, idx } of available) {
          for (let q = 0; q < line.remaining; q += 1) {
            units.push({ idx, list: line.listUnitPrice });
          }
        }
        units.sort((a, b) => b.list - a.list);
        const buy = units.slice(0, rules.buyQty);
        const rest = units.slice(rules.buyQty).sort((a, b) => a.list - b.list);
        const get = rest.slice(0, rules.getQty);
        if (buy.length < rules.buyQty || get.length < rules.getQty) break;

        let savings = 0;
        for (const u of buy) {
          work[u.idx].charged = money(work[u.idx].charged + u.list);
          work[u.idx].remaining -= 1;
          if (!work[u.idx].offerIds.includes(offer.id)) work[u.idx].offerIds.push(offer.id);
        }
        for (const u of get) {
          const getPrice = bogoUnitForGet(u.list, rules);
          work[u.idx].charged = money(work[u.idx].charged + getPrice);
          work[u.idx].remaining -= 1;
          if (!work[u.idx].offerIds.includes(offer.id)) work[u.idx].offerIds.push(offer.id);
          savings = money(savings + (u.list - getPrice));
        }
        addApplied(offer, savings);
      }
    }
  }

  // Charge remaining at (possibly item-discounted) unitPrice
  for (const line of work) {
    if (line.remaining > 0) {
      line.charged = money(line.charged + line.unitPrice * line.remaining);
      line.remaining = 0;
    }
    const qty = line.quantity;
    line.lineTotal = money(line.charged);
    // Effective average unit for order snapshot
    line.unitPrice = qty > 0 ? money(line.charged / qty) : line.unitPrice;
  }

  // ITEM_DISCOUNT savings tracking
  for (const line of work) {
    for (const offerId of line.offerIds) {
      const offer = itemDiscountOffers.find((o) => o.id === offerId);
      if (!offer) continue;
      const listLine = money(line.listUnitPrice * line.quantity);
      // Only attribute item-discount portion when no combo/bogo also on line — use list vs charged clamped
      const savings = money(Math.max(0, listLine - line.lineTotal));
      if (savings > 0 && line.offerIds.length === 1) addApplied(offer, savings);
    }
  }

  const lines: PricingLineOut[] = work.map(({ remaining: _r, charged: _c, ...line }) => line);
  const subtotal = money(lines.reduce((s, l) => s + l.lineTotal, 0));
  const listSubtotal = money(lines.reduce((s, l) => s + l.listUnitPrice * l.quantity, 0));
  const discount = money(Math.max(0, listSubtotal - subtotal));

  for (const applied of discountByOffer.values()) offersApplied.push(applied);
  offersApplied.sort((a, b) => a.offerId - b.offerId);

  // If tracking missed, ensure discount matches
  if (offersApplied.length === 0 && discount > 0) {
    // leave offersApplied empty but keep discount number
  }

  return { lines, discount, offersApplied, subtotal };
}

/** Guest preview of ITEM_DISCOUNT unit price for display (badge / strike). */
export function previewItemDiscountPrice(
  listPrice: number,
  rules: ItemDiscountRules | null | undefined,
): number | null {
  if (!rules) return null;
  const next = discountUnit(listPrice, rules);
  return next < listPrice ? next : null;
}
