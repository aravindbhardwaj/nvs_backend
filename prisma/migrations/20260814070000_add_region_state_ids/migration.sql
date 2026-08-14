-- Keep this nullable for existing regions. The API requires state_ids for all
-- subsequently created regions, while preserving legacy region records.
ALTER TABLE "nvs_regions" ADD COLUMN "state_ids" TEXT;
