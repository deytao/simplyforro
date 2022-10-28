-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "template_id" INTEGER;

UPDATE subscription
SET
    slug = 'last-updated-events-daily',
    frequency = 'daily'::"Frequency",
    template_id = 4315842
WHERE slug = 'last-updated-events-weekly';

UPDATE subscription
SET template_id = 4304516
WHERE slug = 'weekly-forro-calendar';
