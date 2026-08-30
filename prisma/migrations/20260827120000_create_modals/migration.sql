CREATE TABLE "nvs_modals" (
    "id" SERIAL NOT NULL,
    "text_english" TEXT NOT NULL,
    "text_hindi" TEXT NOT NULL,
    "link" VARCHAR(2048) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    CONSTRAINT "nvs_modals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nvs_modals_is_active_idx" ON "nvs_modals"("is_active");
CREATE INDEX "nvs_modals_display_order_idx" ON "nvs_modals"("display_order");
CREATE INDEX "nvs_modals_is_active_display_order_idx" ON "nvs_modals"("is_active", "display_order");
CREATE INDEX "nvs_modals_is_deleted_idx" ON "nvs_modals"("is_deleted");

ALTER TABLE "nvs_modals" ADD CONSTRAINT "nvs_modals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_modals" ADD CONSTRAINT "nvs_modals_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_modals" ADD CONSTRAINT "nvs_modals_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "nvs_permissions" ("permission_key", "module", "action", "description")
VALUES
  ('MODAL_CREATE', 'MODAL', 'CREATE', 'Create modals.'),
  ('MODAL_VIEW', 'MODAL', 'VIEW', 'View modals.'),
  ('MODAL_UPDATE', 'MODAL', 'UPDATE', 'Update modals.'),
  ('MODAL_DELETE', 'MODAL', 'DELETE', 'Delete modals.')
ON CONFLICT ("permission_key") DO NOTHING;

INSERT INTO "nvs_role_permissions" ("role", "permission_id")
SELECT role_name::"Role", permission."id"
FROM unnest(ARRAY['SUPER_ADMIN', 'HEADQUARTER', 'NLI', 'REGIONAL', 'JNV']) AS role_name
CROSS JOIN "nvs_permissions" AS permission
WHERE permission."permission_key" IN (
  'MODAL_CREATE',
  'MODAL_VIEW',
  'MODAL_UPDATE',
  'MODAL_DELETE'
)
ON CONFLICT ("role", "permission_id") DO NOTHING;
