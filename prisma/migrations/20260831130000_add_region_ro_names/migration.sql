-- AlterTable
ALTER TABLE "nvs_regions"
ADD COLUMN IF NOT EXISTS "dc_ro_name" VARCHAR(150),
ADD COLUMN IF NOT EXISTS "dc_ro_name_hi" TEXT;
