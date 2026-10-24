import { prisma } from "@/lib/prisma";

let ready = false;

export async function ensureGuestQrEventsTable() {
  if (ready) return;

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "GuestQrEventType" AS ENUM ('GENERATED', 'DOWNLOADED');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.guest_qr_events (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      event "GuestQrEventType" NOT NULL,
      qr_type "QRType" NOT NULL,
      source TEXT NOT NULL,
      source_path TEXT NOT NULL,
      device_type "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
      browser TEXT,
      os TEXT,
      country TEXT,
      city TEXT,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS guest_qr_events_session_id_idx ON public.guest_qr_events(session_id)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS guest_qr_events_created_at_idx ON public.guest_qr_events(created_at)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS guest_qr_events_event_created_at_idx ON public.guest_qr_events(event, created_at)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS guest_qr_events_qr_type_idx ON public.guest_qr_events(qr_type)`);

  ready = true;
}
