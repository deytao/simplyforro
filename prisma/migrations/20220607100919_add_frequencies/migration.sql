-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "excluded_on" DATE[],
ADD COLUMN     "frequency" "Frequency";
