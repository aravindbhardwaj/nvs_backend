-- CreateTable
CREATE TABLE "nvs_gallery_images" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "alt_text" VARCHAR(255),
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

    CONSTRAINT "nvs_gallery_images_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvs_gallery_images_stored_filename_key" ON "nvs_gallery_images"("stored_filename");
CREATE INDEX "nvs_gallery_images_organization_id_idx" ON "nvs_gallery_images"("organization_id");
CREATE INDEX "nvs_gallery_images_is_active_idx" ON "nvs_gallery_images"("is_active");
CREATE INDEX "nvs_gallery_images_display_order_idx" ON "nvs_gallery_images"("display_order");
CREATE INDEX "nvs_gallery_images_organization_id_is_active_display_order_idx" ON "nvs_gallery_images"("organization_id", "is_active", "display_order");
CREATE INDEX "nvs_gallery_images_is_deleted_idx" ON "nvs_gallery_images"("is_deleted");

ALTER TABLE "nvs_gallery_images" ADD CONSTRAINT "nvs_gallery_images_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_gallery_images" ADD CONSTRAINT "nvs_gallery_images_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_gallery_images" ADD CONSTRAINT "nvs_gallery_images_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_gallery_images" ADD CONSTRAINT "nvs_gallery_images_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
