-- CreateEnum
CREATE TYPE "MenuOrderStatus" AS ENUM ('PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'REJECTED');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN "ordering_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_orders" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "public_token" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "table_number" TEXT,
    "status" "MenuOrderStatus" NOT NULL DEFAULT 'PLACED',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "reject_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "menu_item_id" INTEGER,
    "name" TEXT NOT NULL,
    "variant_label" TEXT,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "menu_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_order_events" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "status" "MenuOrderStatus" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_order_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_public_id_key" ON "customers"("public_id");
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");
CREATE UNIQUE INDEX "menu_orders_public_id_key" ON "menu_orders"("public_id");
CREATE UNIQUE INDEX "menu_orders_public_token_key" ON "menu_orders"("public_token");
CREATE UNIQUE INDEX "menu_orders_restaurant_id_idempotency_key_key" ON "menu_orders"("restaurant_id", "idempotency_key");
CREATE INDEX "menu_orders_restaurant_id_status_created_at_idx" ON "menu_orders"("restaurant_id", "status", "created_at");
CREATE INDEX "menu_orders_customer_id_restaurant_id_idx" ON "menu_orders"("customer_id", "restaurant_id");
CREATE INDEX "menu_order_items_order_id_idx" ON "menu_order_items"("order_id");
CREATE INDEX "menu_order_events_order_id_idx" ON "menu_order_events"("order_id");

-- AddForeignKey
ALTER TABLE "menu_orders" ADD CONSTRAINT "menu_orders_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_orders" ADD CONSTRAINT "menu_orders_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_orders" ADD CONSTRAINT "menu_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "menu_order_items" ADD CONSTRAINT "menu_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "menu_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "menu_order_events" ADD CONSTRAINT "menu_order_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "menu_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
