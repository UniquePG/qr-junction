-- Multilingual menu: locale enablement + i18n JSON on restaurant/menu entities

ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "menus" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "menu_categories" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "i18n" JSONB;

CREATE TABLE IF NOT EXISTS "restaurant_locales" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "last_error" TEXT,
    "last_translated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "restaurant_locales_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "restaurant_locales_restaurant_id_code_key"
  ON "restaurant_locales"("restaurant_id", "code");

CREATE INDEX IF NOT EXISTS "restaurant_locales_restaurant_id_active_idx"
  ON "restaurant_locales"("restaurant_id", "active");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'restaurant_locales_restaurant_id_fkey'
  ) THEN
    ALTER TABLE "restaurant_locales"
      ADD CONSTRAINT "restaurant_locales_restaurant_id_fkey"
      FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill English locale for every existing restaurant
INSERT INTO "restaurant_locales" ("restaurant_id", "code", "active", "status", "created_at", "updated_at")
SELECT r."id", 'en', true, 'ready', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "restaurants" r
WHERE NOT EXISTS (
  SELECT 1 FROM "restaurant_locales" rl
  WHERE rl."restaurant_id" = r."id" AND rl."code" = 'en'
);
