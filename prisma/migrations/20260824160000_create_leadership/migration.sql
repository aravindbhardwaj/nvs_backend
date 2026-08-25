CREATE TABLE "nvs_leaders" (
    "id" SERIAL NOT NULL,
    "leader_name_english" VARCHAR(255) NOT NULL,
    "leader_name_hindi" VARCHAR(255) NOT NULL,
    "leader_designation_english" VARCHAR(255) NOT NULL,
    "leader_designation_hindi" VARCHAR(255) NOT NULL,
    "stored_filename" VARCHAR(255) NOT NULL,
    "image_path" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    CONSTRAINT "nvs_leaders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvs_leaders_stored_filename_key" ON "nvs_leaders"("stored_filename");
CREATE INDEX "nvs_leaders_is_active_idx" ON "nvs_leaders"("is_active");
CREATE INDEX "nvs_leaders_display_order_idx" ON "nvs_leaders"("display_order");
CREATE INDEX "nvs_leaders_is_active_display_order_idx" ON "nvs_leaders"("is_active", "display_order");
CREATE INDEX "nvs_leaders_is_deleted_idx" ON "nvs_leaders"("is_deleted");
ALTER TABLE "nvs_leaders" ADD CONSTRAINT "nvs_leaders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_leaders" ADD CONSTRAINT "nvs_leaders_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_leaders" ADD CONSTRAINT "nvs_leaders_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "nvs_permissions" ("permission_key", "module", "action", "description")
VALUES
  ('LEADERSHIP_CREATE', 'LEADERSHIP', 'CREATE', 'Create leaders.'),
  ('LEADERSHIP_VIEW', 'LEADERSHIP', 'VIEW', 'View leaders.'),
  ('LEADERSHIP_UPDATE', 'LEADERSHIP', 'UPDATE', 'Update leaders.'),
  ('LEADERSHIP_DELETE', 'LEADERSHIP', 'DELETE', 'Delete leaders.')
ON CONFLICT ("permission_key") DO NOTHING;

INSERT INTO "nvs_role_permissions" ("role", "permission_id")
SELECT role_name::"Role", permission."id"
FROM unnest(ARRAY['SUPER_ADMIN', 'HEADQUARTER', 'NLI', 'REGIONAL', 'JNV']) AS role_name
CROSS JOIN "nvs_permissions" AS permission
WHERE permission."permission_key" IN (
  'LEADERSHIP_CREATE',
  'LEADERSHIP_VIEW',
  'LEADERSHIP_UPDATE',
  'LEADERSHIP_DELETE'
)
ON CONFLICT ("role", "permission_id") DO NOTHING;
