-- Opt-in menu hours. Existing restaurants stay hidden until the owner turns this on.
ALTER TABLE "restaurants" ADD COLUMN "show_opening_hours" BOOLEAN NOT NULL DEFAULT false;
