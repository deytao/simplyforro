-- Rename objects
ALTER TABLE "Event" RENAME TO event;
ALTER TABLE event RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE event RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE event RENAME CONSTRAINT "Event_pkey" TO event_pkey;
ALTER SEQUENCE "Event_id_seq" RENAME TO event_id_seq;
