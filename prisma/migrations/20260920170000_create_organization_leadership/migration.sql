CREATE TABLE "nvs_organization_leaders" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" INTEGER NOT NULL,
    "leader_name_english" VARCHAR(255) NOT NULL,
    "leader_name_hindi" VARCHAR(255),
    "leader_designation_english" VARCHAR(255) NOT NULL,
    "leader_designation_hindi" VARCHAR(255),
    "message_english" TEXT,
    "message_hindi" TEXT,
    "stored_filename" VARCHAR(255) NOT NULL,
    "image_path" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "nvs_organization_leaders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvs_organization_leaders_uuid_key"
ON "nvs_organization_leaders"("uuid");

CREATE UNIQUE INDEX "nvs_organization_leaders_stored_filename_key"
ON "nvs_organization_leaders"("stored_filename");

CREATE UNIQUE INDEX "nvs_organization_leaders_one_current_per_org_key"
ON "nvs_organization_leaders"("organization_id")
WHERE "is_deleted" = false;

CREATE INDEX "nvs_organization_leaders_organization_id_idx"
ON "nvs_organization_leaders"("organization_id");

CREATE INDEX "nvs_organization_leaders_organization_id_is_active_is_deleted_idx"
ON "nvs_organization_leaders"("organization_id", "is_active", "is_deleted");

CREATE INDEX "nvs_organization_leaders_is_deleted_idx"
ON "nvs_organization_leaders"("is_deleted");

ALTER TABLE "nvs_organization_leaders"
ADD CONSTRAINT "nvs_organization_leaders_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "nvs_organization_leaders"
ADD CONSTRAINT "nvs_organization_leaders_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "nvs_organization_leaders"
ADD CONSTRAINT "nvs_organization_leaders_updated_by_fkey"
FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "nvs_organization_leaders"
ADD CONSTRAINT "nvs_organization_leaders_deleted_by_fkey"
FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
