-- Add the fields as nullable first so this migration also works when officers
-- already exist. Existing English values are retained as a temporary fallback;
-- all new and updated values are validated by the API.
ALTER TABLE "nvs_who_is_who"
ADD COLUMN "officer_name_hi" VARCHAR(255),
ADD COLUMN "designation_hi" TEXT;

UPDATE "nvs_who_is_who"
SET
  "officer_name_hi" = "officer_name",
  "designation_hi" = "designation"
WHERE "officer_name_hi" IS NULL OR "designation_hi" IS NULL;

ALTER TABLE "nvs_who_is_who"
ALTER COLUMN "officer_name_hi" SET NOT NULL,
ALTER COLUMN "designation_hi" SET NOT NULL;
