-- CreateEnum
CREATE TYPE "Category" AS ENUM ('pratica', 'class', 'workshop', 'party', 'festival');

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ,
    "url" TEXT,
    "city" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "categories" "Category"[],

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
