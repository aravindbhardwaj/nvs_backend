ALTER TABLE "nvs_gallery_images"
  ADD COLUMN "visible_to_all" BOOLEAN;

CREATE INDEX "nvs_gallery_images_organization_id_visible_to_all_idx"
  ON "nvs_gallery_images"("organization_id", "visible_to_all");
