-- CreateEnum
CREATE TYPE "GuestQrEventType" AS ENUM ('GENERATED', 'DOWNLOADED');

-- CreateTable
CREATE TABLE "guest_qr_events" (
    "id" SERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "event" "GuestQrEventType" NOT NULL,
    "qr_type" "QRType" NOT NULL,
    "source" TEXT NOT NULL,
    "source_path" TEXT NOT NULL,
    "device_type" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_qr_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guest_qr_events_session_id_idx" ON "guest_qr_events"("session_id");

-- CreateIndex
CREATE INDEX "guest_qr_events_created_at_idx" ON "guest_qr_events"("created_at");

-- CreateIndex
CREATE INDEX "guest_qr_events_event_created_at_idx" ON "guest_qr_events"("event", "created_at");

-- CreateIndex
CREATE INDEX "guest_qr_events_qr_type_idx" ON "guest_qr_events"("qr_type");
