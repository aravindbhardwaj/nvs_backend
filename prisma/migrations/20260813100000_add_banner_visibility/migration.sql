ALTER TABLE "nvs_banners"
  ADD COLUMN "visible_to_all" BOOLEAN;

CREATE INDEX "nvs_banners_organization_id_visible_to_all_idx"
  ON "nvs_banners"("organization_id", "visible_to_all");
