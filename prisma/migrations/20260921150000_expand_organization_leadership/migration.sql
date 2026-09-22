ALTER TABLE "nvs_organization_leaders"
ADD COLUMN "visible_to_all" BOOLEAN NOT NULL DEFAULT false;

DROP INDEX IF EXISTS "nvs_organization_leaders_one_current_per_org_key";
