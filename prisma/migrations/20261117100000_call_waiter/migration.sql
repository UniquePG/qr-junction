-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "call_waiter_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "waiter_requests" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "table_number" VARCHAR(64) NOT NULL,
    "reason" VARCHAR(32) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    "guest_key" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),

    CONSTRAINT "waiter_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waiter_requests_restaurant_id_status_created_at_idx" ON "waiter_requests"("restaurant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "waiter_requests_restaurant_id_table_number_created_at_idx" ON "waiter_requests"("restaurant_id", "table_number", "created_at");

-- AddForeignKey
ALTER TABLE "waiter_requests" ADD CONSTRAINT "waiter_requests_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
