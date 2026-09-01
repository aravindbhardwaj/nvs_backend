CREATE TABLE "nvs_jnv_principals" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "principal_name_english" VARCHAR(255) NOT NULL,
    "principal_name_hindi" VARCHAR(255),
    "principal_designation_english" VARCHAR(255),
    "principal_designation_hindi" VARCHAR(255),
    "email" VARCHAR(255),
    "mobile" VARCHAR(20),
    "message_english" TEXT,
    "message_hindi" TEXT,
    "stored_filename" VARCHAR(255),
    "image_path" VARCHAR(500),
    "mime_type" VARCHAR(100),
    "extension" VARCHAR(20),
    "file_size" BIGINT,
    "joined_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relieved_at" DATE,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    CONSTRAINT "nvs_jnv_principals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "nvs_jnv_principals_tenure_check" CHECK ("relieved_at" IS NULL OR "relieved_at" >= "joined_at")
);

CREATE UNIQUE INDEX "nvs_jnv_principals_stored_filename_key" ON "nvs_jnv_principals"("stored_filename");
CREATE UNIQUE INDEX "nvs_jnv_principals_one_current_per_jnv" ON "nvs_jnv_principals"("organization_id") WHERE "relieved_at" IS NULL AND "is_deleted" = false;
CREATE INDEX "nvs_jnv_principals_organization_id_idx" ON "nvs_jnv_principals"("organization_id");
CREATE INDEX "nvs_jnv_principals_organization_id_is_active_is_deleted_idx" ON "nvs_jnv_principals"("organization_id", "is_active", "is_deleted");
CREATE INDEX "nvs_jnv_principals_organization_id_joined_at_idx" ON "nvs_jnv_principals"("organization_id", "joined_at");
CREATE INDEX "nvs_jnv_principals_is_deleted_idx" ON "nvs_jnv_principals"("is_deleted");

ALTER TABLE "nvs_jnv_principals" ADD CONSTRAINT "nvs_jnv_principals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_jnv_principals" ADD CONSTRAINT "nvs_jnv_principals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_jnv_principals" ADD CONSTRAINT "nvs_jnv_principals_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_jnv_principals" ADD CONSTRAINT "nvs_jnv_principals_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
