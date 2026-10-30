-- AlterTable
ALTER TABLE "menu_orders" ADD COLUMN "stage_due_at" TIMESTAMP(3),
ADD COLUMN "paid_at" TIMESTAMP(3);

-- Backfill the current stage clock for plates still in progress
UPDATE "menu_orders"
SET "stage_due_at" = CASE
  WHEN "status" = 'PLACED' THEN "created_at" + interval '5 minutes'
  ELSE COALESCE("expected_ready_at", "created_at" + interval '12 minutes')
END
WHERE "stage_due_at" IS NULL
  AND "status" IN ('PLACED', 'ACCEPTED', 'PREPARING', 'READY');
