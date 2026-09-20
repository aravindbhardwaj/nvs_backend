CREATE TABLE "nvs_header_logos" (
  "id" SERIAL NOT NULL,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" VARCHAR(255),
  "alt_text" VARCHAR(255),
  "stored_filename" VARCHAR(255) NOT NULL,
  "image_path" VARCHAR(500) NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL,
  "extension" VARCHAR(20) NOT NULL,
  "file_size" BIGINT NOT NULL,
  "display_on_jnv" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "created_by" INTEGER,
  "updated_by" INTEGER,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMP(3),
  "deleted_by" INTEGER,
  CONSTRAINT "nvs_header_logos_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "nvs_header_logos_uuid_key" ON "nvs_header_logos"("uuid");
CREATE UNIQUE INDEX "nvs_header_logos_stored_filename_key" ON "nvs_header_logos"("stored_filename");
CREATE INDEX "nvs_header_logos_is_active_is_deleted_idx" ON "nvs_header_logos"("is_active", "is_deleted");
CREATE UNIQUE INDEX "nvs_header_logos_one_active_jnv_logo" ON "nvs_header_logos"((true)) WHERE "display_on_jnv" = true AND "is_active" = true AND "is_deleted" = false;
ALTER TABLE "nvs_header_logos" ADD CONSTRAINT "nvs_header_logos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_header_logos" ADD CONSTRAINT "nvs_header_logos_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_header_logos" ADD CONSTRAINT "nvs_header_logos_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
