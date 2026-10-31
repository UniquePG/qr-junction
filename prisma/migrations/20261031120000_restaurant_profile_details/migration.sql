-- Additive profile details. Existing restaurant rows keep every current column.
-- New columns are nullable, except language, which backfills to English.
ALTER TABLE "restaurants"
ADD COLUMN "phone" TEXT,
ADD COLUMN "whatsapp" TEXT,
ADD COLUMN "email" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "instagram" TEXT,
ADD COLUMN "venue_type" TEXT,
ADD COLUMN "cuisine" TEXT,
ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN "address_line1" TEXT,
ADD COLUMN "address_line2" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "district" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "pincode" TEXT,
ADD COLUMN "gstin" TEXT,
ADD COLUMN "fssai" TEXT,
ADD COLUMN "opening_hours" JSONB;
