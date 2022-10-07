-- CreateEnum
CREATE TYPE "Role" AS ENUM ('contributor', 'teacher', 'student');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "roles" "Role"[],
ALTER COLUMN "email" SET NOT NULL;
