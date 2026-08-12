-- Preserve existing English content and add independently entered Hindi fields.
ALTER TABLE "nvs_content_types" RENAME COLUMN "name" TO "name_english";
ALTER TABLE "nvs_content_types" RENAME COLUMN "description" TO "description_english";
ALTER TABLE "nvs_content_types" ADD COLUMN "name_hindi" VARCHAR(150);
ALTER TABLE "nvs_content_types" ADD COLUMN "description_hindi" TEXT;

ALTER TABLE "nvs_media_types" RENAME COLUMN "name" TO "name_english";
ALTER TABLE "nvs_media_types" RENAME COLUMN "description" TO "description_english";
ALTER TABLE "nvs_media_types" ADD COLUMN "name_hindi" VARCHAR(150);
ALTER TABLE "nvs_media_types" ADD COLUMN "description_hindi" TEXT;

ALTER TABLE "nvs_pages" RENAME COLUMN "title" TO "title_english";
ALTER TABLE "nvs_pages" RENAME COLUMN "short_description" TO "short_description_english";
ALTER TABLE "nvs_pages" RENAME COLUMN "content" TO "content_english";
ALTER TABLE "nvs_pages" ADD COLUMN "title_hindi" VARCHAR(255);
ALTER TABLE "nvs_pages" ADD COLUMN "short_description_hindi" TEXT;
ALTER TABLE "nvs_pages" ADD COLUMN "content_hindi" TEXT;

ALTER TABLE "nvs_media" RENAME COLUMN "title" TO "title_english";
ALTER TABLE "nvs_media" RENAME COLUMN "description" TO "description_english";
ALTER TABLE "nvs_media" ADD COLUMN "title_hindi" VARCHAR(255);
ALTER TABLE "nvs_media" ADD COLUMN "description_hindi" TEXT;

ALTER TABLE "nvs_banners" RENAME COLUMN "title" TO "title_english";
ALTER TABLE "nvs_banners" RENAME COLUMN "description" TO "description_english";
ALTER TABLE "nvs_banners" RENAME COLUMN "alt_text" TO "alt_text_english";
ALTER TABLE "nvs_banners" ADD COLUMN "title_hindi" VARCHAR(255);
ALTER TABLE "nvs_banners" ADD COLUMN "description_hindi" TEXT;
ALTER TABLE "nvs_banners" ADD COLUMN "alt_text_hindi" VARCHAR(255);

ALTER TABLE "nvs_gallery_images" RENAME COLUMN "title" TO "title_english";
ALTER TABLE "nvs_gallery_images" RENAME COLUMN "description" TO "description_english";
ALTER TABLE "nvs_gallery_images" RENAME COLUMN "alt_text" TO "alt_text_english";
ALTER TABLE "nvs_gallery_images" ADD COLUMN "title_hindi" VARCHAR(255);
ALTER TABLE "nvs_gallery_images" ADD COLUMN "description_hindi" TEXT;
ALTER TABLE "nvs_gallery_images" ADD COLUMN "alt_text_hindi" VARCHAR(255);
