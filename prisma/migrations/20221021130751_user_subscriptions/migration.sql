-- CreateTable
CREATE TABLE "subscription" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "next_run" TIMESTAMP NOT NULL,
    "last_run" TIMESTAMP,
    "frequency" "Frequency" NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriber" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" INTEGER NOT NULL,

    CONSTRAINT "subscriber_pkey" PRIMARY KEY ("id")
);

-- First Subscriptions
INSERT INTO subscription (updated_at, title, description, slug, active, next_run, frequency) VALUES
    (CURRENT_TIMESTAMP, 'Weekly Forró Calendar', 'Upcoming events for the following week', 'weekly-forro-calendar', false, NOW(), 'weekly'::"Frequency"),
    (CURRENT_TIMESTAMP, 'Last Updated Events', 'Recently updated events', 'last-updated-events-weekly', false, NOW(), 'weekly'::"Frequency"),
    (CURRENT_TIMESTAMP, 'Events To Review', 'Events still pending review', 'events-to-review-daily', false, NOW(), 'daily'::"Frequency")
;

-- CreateIndex
CREATE UNIQUE INDEX "subscription_slug_key" ON "subscription"("slug");


-- AddForeignKey
ALTER TABLE "subscriber" ADD CONSTRAINT "subscriber_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriber" ADD CONSTRAINT "subscriber_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
