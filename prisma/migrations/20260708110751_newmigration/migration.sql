-- AlterTable
ALTER TABLE "review_responses" ADD COLUMN     "ai_analysis" JSONB,
ADD COLUMN     "ai_reply" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "selected_tags" TEXT,
ADD COLUMN     "sentiment" TEXT,
ADD COLUMN     "urgency" TEXT;
