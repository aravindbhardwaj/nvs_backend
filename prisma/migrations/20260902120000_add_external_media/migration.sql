CREATE TYPE "MediaSourceType" AS ENUM ('FILE', 'EXTERNAL');

ALTER TABLE "nvs_media"
ADD COLUMN "source_type" "MediaSourceType" NOT NULL DEFAULT 'FILE',
ADD COLUMN "external_url" VARCHAR(2048),
ALTER COLUMN "original_filename" DROP NOT NULL,
ALTER COLUMN "stored_filename" DROP NOT NULL,
ALTER COLUMN "file_path" DROP NOT NULL,
ALTER COLUMN "mime_type" DROP NOT NULL,
ALTER COLUMN "extension" DROP NOT NULL,
ALTER COLUMN "file_size" DROP NOT NULL;

ALTER TABLE "nvs_media"
ADD CONSTRAINT "nvs_media_source_check" CHECK (
  (
    "source_type" = 'FILE'
    AND "external_url" IS NULL
    AND "original_filename" IS NOT NULL
    AND "stored_filename" IS NOT NULL
    AND "file_path" IS NOT NULL
    AND "mime_type" IS NOT NULL
    AND "extension" IS NOT NULL
    AND "file_size" IS NOT NULL
  )
  OR
  (
    "source_type" = 'EXTERNAL'
    AND "external_url" IS NOT NULL
    AND "original_filename" IS NULL
    AND "stored_filename" IS NULL
    AND "file_path" IS NULL
    AND "mime_type" IS NULL
    AND "extension" IS NULL
    AND "file_size" IS NULL
    AND "checksum" IS NULL
    AND "hindi_original_filename" IS NULL
    AND "hindi_stored_filename" IS NULL
    AND "hindi_file_path" IS NULL
    AND "hindi_mime_type" IS NULL
    AND "hindi_extension" IS NULL
    AND "hindi_file_size" IS NULL
    AND "hindi_checksum" IS NULL
  )
);
