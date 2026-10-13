ALTER TABLE "nvs_media"
  ADD COLUMN "is_archived" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "archived_at" TIMESTAMP(3),
  ADD COLUMN "archived_by" INTEGER;

ALTER TABLE "nvs_media"
  ADD CONSTRAINT "nvs_media_archived_by_fkey"
  FOREIGN KEY ("archived_by")
  REFERENCES "nvs_users"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

CREATE INDEX "nvs_media_is_archived_is_deleted_updated_at_idx"
  ON "nvs_media"("is_archived", "is_deleted", "updated_at");

CREATE INDEX "nvs_media_media_type_id_is_archived_is_deleted_idx"
  ON "nvs_media"("media_type_id", "is_archived", "is_deleted");
