BEGIN;
    UPDATE subscription
    SET
        active = true,
        public = true,
        next_run = '2022-11-06 10:00:00'
    WHERE slug = 'weekly-forro-calendar';

    UPDATE subscription
    SET
        active = true,
        public = false,
        next_run = '2022-11-05 08:00:00'
    WHERE slug = 'events-to-review-daily';
COMMIT;
