ALTER TABLE "nvs_pages"
  ADD COLUMN "start_date" DATE,
  ADD COLUMN "end_date" DATE;

CREATE INDEX "nvs_pages_status_is_deleted_start_date_end_date_idx"
  ON "nvs_pages"("status", "is_deleted", "start_date", "end_date");
