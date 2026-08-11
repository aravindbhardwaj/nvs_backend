-- CreateTable
CREATE TABLE "nvs_banners" (
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
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "nvs_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nvs_banners_stored_filename_key" ON "nvs_banners"("stored_filename");

-- CreateIndex
CREATE INDEX "nvs_banners_organization_id_idx" ON "nvs_banners"("organization_id");

-- CreateIndex
CREATE INDEX "nvs_banners_is_active_idx" ON "nvs_banners"("is_active");

-- CreateIndex
CREATE INDEX "nvs_banners_display_order_idx" ON "nvs_banners"("display_order");

-- CreateIndex
CREATE INDEX "nvs_banners_organization_id_is_active_display_order_idx" ON "nvs_banners"("organization_id", "is_active", "display_order");

-- CreateIndex
CREATE INDEX "nvs_banners_is_deleted_idx" ON "nvs_banners"("is_deleted");

-- AddForeignKey
ALTER TABLE "nvs_banners" ADD CONSTRAINT "nvs_banners_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_banners" ADD CONSTRAINT "nvs_banners_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_banners" ADD CONSTRAINT "nvs_banners_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_banners" ADD CONSTRAINT "nvs_banners_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
