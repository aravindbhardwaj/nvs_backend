ALTER TABLE "nvs_media"
  ADD CONSTRAINT "nvs_media_archival_state_check"
  CHECK (
    (
      "is_archived" = true
      AND "archived_at" IS NOT NULL
    )
    OR
    (
      "is_archived" = false
      AND "archived_at" IS NULL
      AND "archived_by" IS NULL
    )
  );
