-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "ProfileType" NOT NULL DEFAULT 'INDIVIDUAL',
    "business_name" TEXT,
    "logo_url" TEXT,
    "about" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "industry" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
