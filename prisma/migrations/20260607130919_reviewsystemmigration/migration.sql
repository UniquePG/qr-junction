-- AlterEnum
ALTER TYPE "QRType" ADD VALUE 'REVIEW';

-- CreateTable
CREATE TABLE "review_responses" (
    "id" SERIAL NOT NULL,
    "qr_code_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_responses_qr_code_id_idx" ON "review_responses"("qr_code_id");

-- AddForeignKey
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
