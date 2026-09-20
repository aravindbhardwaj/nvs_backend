-- CreateTable
CREATE TABLE "nvs_who_is_who" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "officer_name" VARCHAR(255) NOT NULL,
    "designation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "retirement_date" VARCHAR(10),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "nvs_who_is_who_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nvs_who_is_who_uuid_key" ON "nvs_who_is_who"("uuid");

-- CreateIndex
CREATE INDEX "nvs_who_is_who_is_deleted_is_active_retirement_date_idx" ON "nvs_who_is_who"("is_deleted", "is_active", "retirement_date");

-- AddForeignKey
ALTER TABLE "nvs_who_is_who" ADD CONSTRAINT "nvs_who_is_who_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_who_is_who" ADD CONSTRAINT "nvs_who_is_who_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_who_is_who" ADD CONSTRAINT "nvs_who_is_who_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


INSERT INTO "nvs_permissions" ("permission_key", "module", "action", "description")
VALUES
  ('WHO_IS_WHO_CREATE', 'WHO_IS_WHO', 'CREATE', 'Create officers.'),
  ('WHO_IS_WHO_VIEW', 'WHO_IS_WHO', 'VIEW', 'View officers.'),
  ('WHO_IS_WHO_UPDATE', 'WHO_IS_WHO', 'UPDATE', 'Update officers.'),
  ('WHO_IS_WHO_DELETE', 'WHO_IS_WHO', 'DELETE', 'Delete officers.')
ON CONFLICT ("permission_key") DO NOTHING;

INSERT INTO "nvs_role_permissions" ("role", "permission_id")
SELECT role_name::"Role", permission."id"
FROM unnest(ARRAY['SUPER_ADMIN', 'HEADQUARTER', 'NLI', 'REGIONAL', 'JNV']) AS role_name
CROSS JOIN "nvs_permissions" AS permission
WHERE permission."permission_key" IN (
  'WHO_IS_WHO_CREATE',
  'WHO_IS_WHO_VIEW',
  'WHO_IS_WHO_UPDATE',
  'WHO_IS_WHO_DELETE'
)
ON CONFLICT ("role", "permission_id") DO NOTHING;
