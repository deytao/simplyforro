-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

UPDATE subscription SET active = true WHERE slug IN ('events-to-review-daily');
