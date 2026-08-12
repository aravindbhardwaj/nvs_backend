ALTER TABLE "nvs_media"
  ADD COLUMN "hindi_original_filename" VARCHAR(255),
  ADD COLUMN "hindi_stored_filename" VARCHAR(255),
  ADD COLUMN "hindi_file_path" VARCHAR(500),
  ADD COLUMN "hindi_mime_type" VARCHAR(100),
  ADD COLUMN "hindi_extension" VARCHAR(20),
  ADD COLUMN "hindi_file_size" BIGINT,
  ADD COLUMN "hindi_checksum" VARCHAR(255);

CREATE UNIQUE INDEX "nvs_media_hindi_stored_filename_key"
  ON "nvs_media"("hindi_stored_filename");
