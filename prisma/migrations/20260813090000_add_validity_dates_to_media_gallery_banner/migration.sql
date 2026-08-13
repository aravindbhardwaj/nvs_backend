-- Add optional calendar-date validity fields without changing existing records.
ALTER TABLE "nvs_media"
  ADD COLUMN "start_date" DATE,
  ADD COLUMN "end_date" DATE;

ALTER TABLE "nvs_gallery_images"
  ADD COLUMN "start_date" DATE,
  ADD COLUMN "end_date" DATE;

-- Banner dates existed as timestamps; retain their calendar date when normalizing.
ALTER TABLE "nvs_banners"
  ALTER COLUMN "start_date" TYPE DATE USING "start_date"::date,
  ALTER COLUMN "end_date" TYPE DATE USING "end_date"::date;
