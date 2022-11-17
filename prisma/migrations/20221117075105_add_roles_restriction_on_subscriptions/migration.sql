-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "roles" "Role"[] NOT NULL DEFAULT '{}';

UPDATE subscription SET updated_at = NOW(), roles = '{contributor}' WHERE slug = 'events-to-review-daily';
