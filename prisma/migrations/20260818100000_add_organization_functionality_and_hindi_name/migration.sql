ALTER TABLE "nvs_organizations"
  ADD COLUMN "organization_hindi_name" VARCHAR(255),
  ADD COLUMN "is_functional" BOOLEAN NOT NULL DEFAULT true;
