DROP INDEX IF EXISTS "nvs_organizations_organization_code_key";

ALTER TABLE "nvs_organizations"
  ADD COLUMN "school_url" VARCHAR(255);

CREATE UNIQUE INDEX "nvs_organizations_school_url_key"
  ON "nvs_organizations"("school_url");
