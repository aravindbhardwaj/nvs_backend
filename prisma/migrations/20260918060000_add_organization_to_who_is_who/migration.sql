ALTER TABLE "nvs_who_is_who"
ADD COLUMN "organization_id" INTEGER;

UPDATE "nvs_who_is_who" AS officer
SET "organization_id" = creator."organization_id"
FROM "nvs_users" AS creator
WHERE officer."created_by" = creator."id"
  AND officer."organization_id" IS NULL;

UPDATE "nvs_who_is_who"
SET "organization_id" = (
  SELECT "id"
  FROM "nvs_organizations"
  WHERE "is_deleted" = FALSE
  ORDER BY "id"
  LIMIT 1
)
WHERE "organization_id" IS NULL;

ALTER TABLE "nvs_who_is_who"
ALTER COLUMN "organization_id" SET NOT NULL;

ALTER TABLE "nvs_who_is_who"
ADD CONSTRAINT "nvs_who_is_who_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "nvs_who_is_who_organization_id_idx"
ON "nvs_who_is_who"("organization_id");
