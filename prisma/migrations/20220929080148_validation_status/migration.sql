-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('pending', 'validated', 'rejected');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "validation_status" "ValidationStatus" NOT NULL DEFAULT E'pending';

-- Update existing records
UPDATE "Event" SET validation_status = 'validated'::"ValidationStatus";
