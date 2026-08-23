-- Keep visible_to_jnv as a legacy column so existing data is not destructively
-- altered. New media visibility uses the explicit jnv_ids CSV column.
ALTER TABLE "nvs_media"
  ADD COLUMN "jnv_ids" TEXT;
