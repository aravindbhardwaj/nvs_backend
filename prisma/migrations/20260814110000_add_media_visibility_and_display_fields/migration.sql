ALTER TABLE "nvs_media"
  ADD COLUMN "display_order" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "visible_to_all" BOOLEAN;

CREATE INDEX "nvs_media_is_active_idx" ON "nvs_media"("is_active");
CREATE INDEX "nvs_media_display_order_idx" ON "nvs_media"("display_order");
CREATE INDEX "nvs_media_organization_id_is_active_display_order_idx"
  ON "nvs_media"("organization_id", "is_active", "display_order");
CREATE INDEX "nvs_media_organization_id_visible_to_all_idx"
  ON "nvs_media"("organization_id", "visible_to_all");
