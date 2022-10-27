-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

UPDATE subscription SET public = true, active = true WHERE slug IN ('weekly-forro-calendar');
