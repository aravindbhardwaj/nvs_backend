-- Keep the Role enum for role-permission records, but remove it from users.
INSERT INTO "nvs_organization_types" ("id", "code", "name", "is_active", "created_at", "updated_at")
VALUES (5, 'SUPER_ADMIN', 'Super Administrator', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE
SET "code" = EXCLUDED."code", "name" = EXCLUDED."name", "is_active" = true;

ALTER TABLE "nvs_users" ADD COLUMN "organization_type_id" INTEGER;

UPDATE "nvs_users" AS u
SET "organization_type_id" = ot."id"
FROM "nvs_organization_types" AS ot
WHERE ot."code" = CASE u."role"::text
  WHEN 'REGIONAL' THEN 'REGIONAL_OFFICE'
  ELSE u."role"::text
END;

ALTER TABLE "nvs_users"
  ALTER COLUMN "organization_type_id" SET NOT NULL,
  ADD CONSTRAINT "nvs_users_organization_type_id_fkey"
    FOREIGN KEY ("organization_type_id") REFERENCES "nvs_organization_types"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "nvs_users_organization_type_id_idx" ON "nvs_users"("organization_type_id");
DROP INDEX IF EXISTS "nvs_users_role_idx";
ALTER TABLE "nvs_users" DROP COLUMN "role";
