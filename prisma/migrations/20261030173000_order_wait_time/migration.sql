-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "prep_minutes" INTEGER NOT NULL DEFAULT 12;

-- AlterTable
ALTER TABLE "menu_orders" ADD COLUMN "expected_ready_at" TIMESTAMP(3);
