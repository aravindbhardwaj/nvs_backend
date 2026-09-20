-- Apply before deploying the application that reads MediaType.uuid.
-- PostgreSQL must provide gen_random_uuid() (built in on PostgreSQL 13+).
-- Existing numeric primary keys and foreign keys are preserved.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE "nvs_media_types" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_media_types" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_media_types" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_media_types" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_media_types_uuid_key" ON "nvs_media_types"("uuid");

COMMIT;
