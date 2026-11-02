-- CreateEnum
CREATE TYPE "PlanScope" AS ENUM ('ACCOUNT', 'SUITE');

-- CreateEnum
CREATE TYPE "FeatureKind" AS ENUM ('BOOLEAN', 'QUOTA', 'MONTHLY', 'LIFETIME', 'ALLOWLIST');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "SubscriptionSource" AS ENUM ('MIGRATION', 'SIGNUP', 'ADMIN', 'RAZORPAY');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "feature_definitions" (
    "key" TEXT NOT NULL,
    "suite" TEXT NOT NULL,
    "kind" "FeatureKind" NOT NULL,
    "label" TEXT NOT NULL,
    "shipped" BOOLEAN NOT NULL DEFAULT true,
    "early" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "feature_definitions_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scope" "PlanScope" NOT NULL DEFAULT 'ACCOUNT',
    "name" TEXT NOT NULL,
    "monthly_price_paise" INTEGER NOT NULL DEFAULT 0,
    "yearly_price_paise" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_limits" (
    "plan_id" TEXT NOT NULL,
    "feature_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "quota" INTEGER NOT NULL DEFAULT 0,
    "allowlist" JSONB,

    CONSTRAINT "plan_limits_pkey" PRIMARY KEY ("plan_id","feature_key")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" "SubscriptionSource" NOT NULL,
    "interval" "BillingInterval",
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "grace_until" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "locked_price_paise" INTEGER,
    "provider" TEXT,
    "provider_customer_id" TEXT,
    "provider_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entitlement_overrides" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "feature_key" TEXT NOT NULL,
    "enabled" BOOLEAN,
    "quota" INTEGER,
    "allowlist" JSONB,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3),
    "note" TEXT,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entitlement_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_counters" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "feature_key" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_events" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_event_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_provider_subscription_id_key" ON "subscriptions"("provider_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions"("plan_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "entitlement_overrides_subscription_id_feature_key_idx" ON "entitlement_overrides"("subscription_id", "feature_key");

-- CreateIndex
CREATE UNIQUE INDEX "usage_counters_subscription_id_feature_key_period_start_key" ON "usage_counters"("subscription_id", "feature_key", "period_start");

-- CreateIndex
CREATE INDEX "subscription_events_subscription_id_created_at_idx" ON "subscription_events"("subscription_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "billing_events_provider_provider_event_id_key" ON "billing_events"("provider", "provider_event_id");

-- AddForeignKey
ALTER TABLE "plan_limits" ADD CONSTRAINT "plan_limits_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_limits" ADD CONSTRAINT "plan_limits_feature_key_fkey" FOREIGN KEY ("feature_key") REFERENCES "feature_definitions"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlement_overrides" ADD CONSTRAINT "entitlement_overrides_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlement_overrides" ADD CONSTRAINT "entitlement_overrides_feature_key_fkey" FOREIGN KEY ("feature_key") REFERENCES "feature_definitions"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlement_overrides" ADD CONSTRAINT "entitlement_overrides_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_feature_key_fkey" FOREIGN KEY ("feature_key") REFERENCES "feature_definitions"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed plans, features, limits, and grandfather existing accounts
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('platform.qr.dynamic', 'platform', 'QUOTA'::"FeatureKind", 'Dynamic QR codes', true, false, 10) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('platform.scans.monthly', 'platform', 'MONTHLY'::"FeatureKind", 'Dynamic QR scans each month', true, false, 20) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('platform.analytics.advanced', 'platform', 'BOOLEAN'::"FeatureKind", 'Advanced scan analytics', true, false, 30) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('platform.landing.count', 'platform', 'QUOTA'::"FeatureKind", 'Personal profile cards', true, false, 40) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('platform.landing.analytics', 'platform', 'BOOLEAN'::"FeatureKind", 'Profile card analytics', true, false, 50) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('platform.campaigns', 'platform', 'QUOTA'::"FeatureKind", 'Campaigns', true, false, 60) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('platform.leads', 'platform', 'BOOLEAN'::"FeatureKind", 'Lead capture forms', true, false, 70) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('platform.early_access', 'platform', 'BOOLEAN'::"FeatureKind", 'Early access to new features', true, false, 80) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.menu.count', 'restaurant', 'QUOTA'::"FeatureKind", 'Menus', true, false, 110) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.menu.items_per_menu', 'restaurant', 'QUOTA'::"FeatureKind", 'Items on each menu', true, false, 120) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.menu.edit', 'restaurant', 'BOOLEAN'::"FeatureKind", 'Menu updates', true, false, 130) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.menu.themes', 'restaurant', 'ALLOWLIST'::"FeatureKind", 'Menu layouts', true, false, 140) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.menu.themes.early', 'restaurant', 'BOOLEAN'::"FeatureKind", 'Early menu layouts', true, false, 150) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.tables', 'restaurant', 'QUOTA'::"FeatureKind", 'Tables', true, false, 160) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.scans.monthly', 'restaurant', 'MONTHLY'::"FeatureKind", 'Menu and table scans each month', true, false, 170) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.ai_import.lifetime', 'restaurant', 'LIFETIME'::"FeatureKind", 'AI menu scans, one-time', true, false, 180) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.ai_import.monthly', 'restaurant', 'MONTHLY'::"FeatureKind", 'AI menu scans each month', true, false, 190) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.ordering', 'restaurant', 'BOOLEAN'::"FeatureKind", 'Live table orders', true, false, 200) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.menu.languages', 'restaurant', 'ALLOWLIST'::"FeatureKind", 'Menu languages', true, false, 210) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.offers', 'restaurant', 'BOOLEAN'::"FeatureKind", 'Offers and promotions', false, false, 220) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.offers.custom', 'restaurant', 'BOOLEAN'::"FeatureKind", 'Custom discounts', false, false, 230) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.orders.bill_attach', 'restaurant', 'BOOLEAN'::"FeatureKind", 'Attach a bill to an order', false, false, 240) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.orders.digital_bill', 'restaurant', 'BOOLEAN'::"FeatureKind", 'Digital bill sent to the customer', false, false, 250) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.orders.item_reviews', 'restaurant', 'BOOLEAN'::"FeatureKind", 'Reviews on dishes', false, false, 260) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('restaurant.staff.seats', 'restaurant', 'QUOTA'::"FeatureKind", 'Staff logins', false, false, 270) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('reviews.qr.count', 'reviews', 'QUOTA'::"FeatureKind", 'Review QR codes', true, false, 310) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('reviews.ai_suggestions', 'reviews', 'BOOLEAN'::"FeatureKind", 'AI review suggestions', true, false, 320) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('reviews.smart_redirect', 'reviews', 'BOOLEAN'::"FeatureKind", 'Smart public review redirect', true, false, 330) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "feature_definitions" ("key", "suite", "kind", "label", "shipped", "early", "sort_order") VALUES ('reviews.ai_analytics', 'reviews', 'BOOLEAN'::"FeatureKind", 'AI review analytics', true, false, 340) ON CONFLICT ("key") DO NOTHING;
INSERT INTO "plans" ("id", "code", "scope", "name", "monthly_price_paise", "yearly_price_paise", "currency", "is_public", "active", "sort_order", "created_at", "updated_at") VALUES ('plan_free', 'free', 'ACCOUNT', 'Free', 0, 0, 'INR', true, true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT ("code") DO NOTHING;
INSERT INTO "plans" ("id", "code", "scope", "name", "monthly_price_paise", "yearly_price_paise", "currency", "is_public", "active", "sort_order", "created_at", "updated_at") VALUES ('plan_starter', 'starter', 'ACCOUNT', 'Starter', 29900, 299900, 'INR', true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT ("code") DO NOTHING;
INSERT INTO "plans" ("id", "code", "scope", "name", "monthly_price_paise", "yearly_price_paise", "currency", "is_public", "active", "sort_order", "created_at", "updated_at") VALUES ('plan_growth', 'growth', 'ACCOUNT', 'Growth', 69900, 699900, 'INR', true, true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT ("code") DO NOTHING;
INSERT INTO "plans" ("id", "code", "scope", "name", "monthly_price_paise", "yearly_price_paise", "currency", "is_public", "active", "sort_order", "created_at", "updated_at") VALUES ('plan_legacy', 'legacy', 'ACCOUNT', 'Legacy', 0, 0, 'INR', false, true, 99, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT ("code") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.qr.dynamic', true, 1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.qr.dynamic', true, 10, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.qr.dynamic', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.qr.dynamic', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.scans.monthly', true, 200, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.scans.monthly', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.scans.monthly', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.scans.monthly', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.analytics.advanced', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.analytics.advanced', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.analytics.advanced', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.analytics.advanced', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.landing.count', true, 1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.landing.count', true, 5, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.landing.count', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.landing.count', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.landing.analytics', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.landing.analytics', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.landing.analytics', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.landing.analytics', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.campaigns', true, 1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.campaigns', true, 5, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.campaigns', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.campaigns', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.leads', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.leads', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.leads', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.leads', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.early_access', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.early_access', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.early_access', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'platform.early_access', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.count', true, 1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.count', true, 5, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.count', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.count', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.items_per_menu', true, 20, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.items_per_menu', true, 100, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.items_per_menu', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.items_per_menu', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.edit', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.edit', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.edit', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.edit', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.themes', true, 2, '["modern","minimal"]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.themes', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.themes', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.themes', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.themes.early', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.themes.early', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.themes.early', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.themes.early', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.tables', true, 2, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.tables', true, 20, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.tables', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.tables', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.scans.monthly', true, 50, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.scans.monthly', true, 500, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.scans.monthly', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.scans.monthly', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ai_import.lifetime', true, 1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ai_import.lifetime', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ai_import.lifetime', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ai_import.lifetime', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ai_import.monthly', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ai_import.monthly', true, 5, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ai_import.monthly', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ai_import.monthly', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ordering', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ordering', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ordering', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.ordering', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.languages', true, 1, '["en"]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.languages', true, 3, '["en","hi","mr"]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.languages', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.menu.languages', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.offers', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.offers', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.offers', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.offers', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.offers.custom', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.offers.custom', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.offers.custom', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.offers.custom', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.bill_attach', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.bill_attach', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.bill_attach', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.bill_attach', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.digital_bill', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.digital_bill', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.digital_bill', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.digital_bill', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.item_reviews', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.item_reviews', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.item_reviews', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.orders.item_reviews', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.staff.seats', true, 1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.staff.seats', true, 5, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.staff.seats', true, 10, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'restaurant.staff.seats', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.qr.count', true, 1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.qr.count', true, 5, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.qr.count', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.qr.count', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.ai_suggestions', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.ai_suggestions', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.ai_suggestions', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.ai_suggestions', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.smart_redirect', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.smart_redirect', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.smart_redirect', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.smart_redirect', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.ai_analytics', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'free' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.ai_analytics', false, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'starter' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.ai_analytics', true, 0, '[]'::jsonb FROM "plans" p WHERE p."code" = 'growth' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;
INSERT INTO "plan_limits" ("plan_id", "feature_key", "enabled", "quota", "allowlist") SELECT p."id", 'reviews.ai_analytics', true, -1, '[]'::jsonb FROM "plans" p WHERE p."code" = 'legacy' ON CONFLICT ("plan_id", "feature_key") DO NOTHING;

INSERT INTO "subscriptions" ("id", "user_id", "plan_id", "status", "source", "created_at", "updated_at")
SELECT 'legacy_' || u."id", u."id", p."id", 'ACTIVE', 'MIGRATION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users" u
CROSS JOIN "plans" p
WHERE p."code" = 'legacy'
  AND NOT EXISTS (SELECT 1 FROM "subscriptions" s WHERE s."user_id" = u."id");

