/**
 * Lightweight self-check for offer pricing (run: npx tsx lib/offers/pricing.selfcheck.ts).
 * Not part of CI — kept as a smoke harness for the pure engine.
 */
import { applyOfferPricing } from "./pricing";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const discount = applyOfferPricing(
  [{ menuItemId: 1, name: "Burger", variantLabel: null, unitPrice: 200, quantity: 1 }],
  [
    {
      id: 10,
      type: "ITEM_DISCOUNT",
      title: "10% off",
      priority: 1,
      itemIds: [1],
      rules: { mode: "percent", value: 10 },
    },
  ],
);
assert(discount.lines[0].unitPrice === 180, `expected 180 got ${discount.lines[0].unitPrice}`);
assert(discount.discount === 20, `expected discount 20 got ${discount.discount}`);

const bogo = applyOfferPricing(
  [{ menuItemId: 2, name: "Coffee", variantLabel: null, unitPrice: 100, quantity: 2 }],
  [
    {
      id: 11,
      type: "BOGO",
      title: "BOGO",
      priority: 1,
      itemIds: [2],
      rules: { buyQty: 1, getQty: 1, getMode: "free", sameItem: true },
    },
  ],
);
assert(bogo.lines[0].lineTotal === 100, `BOGO expected 100 got ${bogo.lines[0].lineTotal}`);
assert(bogo.discount === 100, `BOGO discount expected 100 got ${bogo.discount}`);

const bogoPool = applyOfferPricing(
  [
    { menuItemId: 2, name: "Cappuccino", variantLabel: null, unitPrice: 120, quantity: 1 },
    { menuItemId: 4, name: "Cold Coffee", variantLabel: null, unitPrice: 140, quantity: 1 },
  ],
  [
    {
      id: 13,
      type: "BOGO",
      title: "BOGO coffee",
      priority: 1,
      itemIds: [2, 4],
      rules: { buyQty: 1, getQty: 1, getMode: "free", sameItem: false },
    },
  ],
);
assert(bogoPool.subtotal === 140, `pool BOGO subtotal expected 140 got ${bogoPool.subtotal}`);
assert(bogoPool.discount === 120, `pool BOGO discount expected 120 got ${bogoPool.discount}`);

const combo = applyOfferPricing(
  [
    { menuItemId: 1, name: "Burger", variantLabel: null, unitPrice: 150, quantity: 1 },
    { menuItemId: 3, name: "Coke", variantLabel: null, unitPrice: 60, quantity: 1 },
  ],
  [
    {
      id: 12,
      type: "COMBO",
      title: "Meal",
      priority: 5,
      itemIds: [1, 3],
      rules: {
        packagePrice: 199,
        slots: [
          { label: "Main", minQty: 1, itemIds: [1] },
          { label: "Drink", minQty: 1, itemIds: [3] },
        ],
      },
    },
  ],
);
assert(combo.subtotal === 199, `combo subtotal expected 199 got ${combo.subtotal}`);
assert(combo.discount === 11, `combo discount expected 11 got ${combo.discount}`);

console.log("offer pricing self-check ok");
