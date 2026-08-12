-- Move the legacy organization-type enum onto the reference-data table used by
-- the Prisma schema, while preserving every existing organization.
CREATE TABLE "nvs_organization_types" (
  "id" INTEGER NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "nvs_organization_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvs_organization_types_code_key"
  ON "nvs_organization_types"("code");
CREATE INDEX "nvs_organization_types_is_active_idx"
  ON "nvs_organization_types"("is_active");

INSERT INTO "nvs_organization_types" ("id", "code", "name") VALUES
  (1, 'HEADQUARTER', 'Headquarters'),
  (2, 'NLI', 'NLI'),
  (3, 'REGIONAL_OFFICE', 'Regional Office'),
  (4, 'JNV', 'JNV');

ALTER TABLE "nvs_organizations"
  ADD COLUMN "organization_type_id" INTEGER;

UPDATE "nvs_organizations" AS organization
SET "organization_type_id" = organization_type."id"
FROM "nvs_organization_types" AS organization_type
WHERE organization_type."code" = organization."organization_type"::text;

ALTER TABLE "nvs_organizations"
  ALTER COLUMN "organization_type_id" SET NOT NULL,
  DROP COLUMN "organization_type";

DROP INDEX IF EXISTS "nvs_organizations_organization_type_idx";
DROP TYPE "OrganizationType";

CREATE INDEX "nvs_organizations_organization_type_id_idx"
  ON "nvs_organizations"("organization_type_id");

ALTER TABLE "nvs_organizations"
  ADD CONSTRAINT "nvs_organizations_organization_type_id_fkey"
  FOREIGN KEY ("organization_type_id")
  REFERENCES "nvs_organization_types"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
