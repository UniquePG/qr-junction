ALTER TABLE "plans" ADD COLUMN "highlights" JSONB NOT NULL DEFAULT '[]';

UPDATE "plans" SET "highlights" = '["1 dynamic QR code","Basic scan analytics","1 profile card and 1 campaign","1 menu with up to 20 items","2 tables","English menu","1 review QR code"]'::jsonb WHERE "code" = 'free';
UPDATE "plans" SET "highlights" = '["10 dynamic QR codes","Unlimited QR scans","Advanced scan analytics","5 profile cards and lead forms","5 menus, 100 items each","20 tables and live orders","English, Hindi, and Marathi","5 review QR codes with AI suggestions"]'::jsonb WHERE "code" = 'starter';
UPDATE "plans" SET "highlights" = '["Unlimited QR codes, menus, and tables","Unlimited scans","All menu layouts","All menu languages","Profile and review analytics","Live table orders","Early access to new features"]'::jsonb WHERE "code" = 'growth';
