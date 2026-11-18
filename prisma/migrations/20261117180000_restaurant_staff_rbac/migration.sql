-- CreateEnum
CREATE TYPE "RestaurantStaffStatus" AS ENUM ('ACTIVE', 'DISABLED', 'INVITED');

-- CreateEnum
CREATE TYPE "RestaurantActorKind" AS ENUM ('OWNER', 'STAFF', 'SYSTEM');

-- CreateTable
CREATE TABLE "restaurant_roles" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(240),
    "permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_staff" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "display_name" VARCHAR(80) NOT NULL,
    "phone" VARCHAR(32),
    "avatar_url" TEXT,
    "joined_at" TIMESTAMP(3),
    "status" "RestaurantStaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "documents" JSONB,
    "created_by_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "actor_user_id" INTEGER NOT NULL,
    "actor_kind" "RestaurantActorKind" NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "resource_type" VARCHAR(64) NOT NULL,
    "resource_id" VARCHAR(80),
    "summary" VARCHAR(280) NOT NULL,
    "meta" JSONB,
    "ip" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_audit_logs_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "waiter_requests" ADD COLUMN "acknowledged_by_user_id" INTEGER;

-- AlterTable
ALTER TABLE "menu_order_events" ADD COLUMN "actor_user_id" INTEGER;

-- CreateIndex
CREATE INDEX "restaurant_roles_restaurant_id_idx" ON "restaurant_roles"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_roles_restaurant_id_name_key" ON "restaurant_roles"("restaurant_id", "name");

-- CreateIndex
CREATE INDEX "restaurant_staff_user_id_status_idx" ON "restaurant_staff"("user_id", "status");

-- CreateIndex
CREATE INDEX "restaurant_staff_restaurant_id_status_idx" ON "restaurant_staff"("restaurant_id", "status");

-- CreateIndex
CREATE INDEX "restaurant_staff_role_id_idx" ON "restaurant_staff"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_staff_restaurant_id_user_id_key" ON "restaurant_staff"("restaurant_id", "user_id");

-- CreateIndex
CREATE INDEX "restaurant_audit_logs_restaurant_id_created_at_idx" ON "restaurant_audit_logs"("restaurant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "restaurant_audit_logs_restaurant_id_actor_user_id_created_at_idx" ON "restaurant_audit_logs"("restaurant_id", "actor_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "restaurant_audit_logs_restaurant_id_action_created_at_idx" ON "restaurant_audit_logs"("restaurant_id", "action", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "restaurant_roles" ADD CONSTRAINT "restaurant_roles_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_staff" ADD CONSTRAINT "restaurant_staff_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_staff" ADD CONSTRAINT "restaurant_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_staff" ADD CONSTRAINT "restaurant_staff_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "restaurant_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_audit_logs" ADD CONSTRAINT "restaurant_audit_logs_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_audit_logs" ADD CONSTRAINT "restaurant_audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
