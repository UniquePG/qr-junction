export type MenuOfferType =
  | "ITEM_DISCOUNT"
  | "BOGO"
  | "COMBO"
  | "COLLECTION"
  | "SPECIAL";

export type MenuOfferStatus = "DRAFT" | "ACTIVE" | "PAUSED";

export type OfferScheduleWindow = { start: string; end: string };

export type OfferSchedule = {
  daysOfWeek?: number[];
  windows?: OfferScheduleWindow[];
  timezone?: string;
};

export type OfferPresentation = {
  emphasis?: "rail" | "hero" | "badge";
  accent?: string;
};

export type ItemDiscountRules = {
  mode: "percent" | "amount";
  value: number;
  maxDiscountPerItem?: number;
};

export type BogoRules = {
  buyQty: number;
  getQty: number;
  getMode: "free" | "percent" | "amount";
  getValue?: number;
  sameItem: boolean;
  /** When true with multiple targets, keep same-dish-only (skips legacy pool heal). */
  sameItemStrict?: boolean;
};

export type ComboSlotRules = {
  label: string;
  minQty: number;
  itemIds: number[];
};

export type ComboRules = {
  slots: ComboSlotRules[];
  packagePrice: number;
  compareAtPrice?: number;
};

export type CollectionRules = {
  mode: "under_price" | "manual";
  maxPrice?: number;
  currencyHint?: string;
};

export type SpecialRules = {
  highlightItemIds?: number[];
};

export type OfferRules =
  | ItemDiscountRules
  | BogoRules
  | ComboRules
  | CollectionRules
  | SpecialRules;

export type OfferTargetInput = {
  kind: "ITEM" | "CATEGORY";
  refId: number;
};

export type OfferApplied = {
  offerId: number;
  type: MenuOfferType;
  title: string;
  amount: number;
};

export type GuestOfferDto = {
  id: number;
  type: MenuOfferType;
  title: string;
  subtitle: string | null;
  badgeLabel: string | null;
  imageUrl: string | null;
  priority: number;
  presentation: OfferPresentation | null;
  rules: OfferRules;
  itemIds: number[];
  categoryIds: number[];
};

export type GuestItemOffer = {
  offerId: number;
  type: MenuOfferType;
  badgeLabel: string;
  title: string;
  /** List price → offer unit price when ITEM_DISCOUNT applies to base (no variant). */
  offerUnitPrice?: number | null;
  listUnitPrice?: number | null;
};

export type GuestOfferView = {
  rail: GuestOfferDto[];
  heroes: GuestOfferDto[];
  collections: GuestOfferDto[];
  itemOffers: Record<string, GuestItemOffer>;
};
