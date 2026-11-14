-- CreateEnum
CREATE TYPE "MenuOfferType" AS ENUM ('ITEM_DISCOUNT', 'BOGO', 'COMBO', 'COLLECTION', 'SPECIAL');

-- CreateEnum
CREATE TYPE "MenuOfferStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "MenuOfferTargetKind" AS ENUM ('ITEM', 'CATEGORY');

-- AlterTable
ALTER TABLE "menu_orders" ADD COLUMN "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "offers_applied" JSONB;

-- AlterTable
ALTER TABLE "menu_order_items" ADD COLUMN "list_unit_price" DECIMAL(10,2),
ADD COLUMN "offer_ids" JSONB;

-- CreateTable
CREATE TABLE "menu_offers" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "menu_id" INTEGER,
    "type" "MenuOfferType" NOT NULL,
    "status" "MenuOfferStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "badge_label" TEXT,
    "image_url" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "schedule" JSONB,
    "rules" JSONB NOT NULL,
    "presentation" JSONB,
    "i18n" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_offer_targets" (
    "id" SERIAL NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "kind" "MenuOfferTargetKind" NOT NULL,
    "ref_id" INTEGER NOT NULL,

    CONSTRAINT "menu_offer_targets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_offers_restaurant_id_status_idx" ON "menu_offers"("restaurant_id", "status");

-- CreateIndex
CREATE INDEX "menu_offers_menu_id_status_idx" ON "menu_offers"("menu_id", "status");

-- CreateIndex
CREATE INDEX "menu_offers_restaurant_id_starts_at_ends_at_idx" ON "menu_offers"("restaurant_id", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "menu_offer_targets_kind_ref_id_idx" ON "menu_offer_targets"("kind", "ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "menu_offer_targets_offer_id_kind_ref_id_key" ON "menu_offer_targets"("offer_id", "kind", "ref_id");

-- AddForeignKey
ALTER TABLE "menu_offers" ADD CONSTRAINT "menu_offers_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_offers" ADD CONSTRAINT "menu_offers_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_offer_targets" ADD CONSTRAINT "menu_offer_targets_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "menu_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
