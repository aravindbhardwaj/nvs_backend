CREATE TABLE "nvs_galleries" (
  "id" SERIAL NOT NULL,
  "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" INTEGER NOT NULL,
  "title_english" VARCHAR(255) NOT NULL,
  "title_hindi" VARCHAR(255),
  "description_english" TEXT,
  "description_hindi" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "visible_to_all" BOOLEAN NOT NULL DEFAULT false,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" INTEGER,
  "updated_by" INTEGER,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMP(3),
  "deleted_by" INTEGER,
  CONSTRAINT "nvs_galleries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvs_galleries_uuid_key" ON "nvs_galleries"("uuid");
CREATE INDEX "nvs_galleries_organization_id_idx" ON "nvs_galleries"("organization_id");
CREATE INDEX "nvs_galleries_organization_id_is_active_display_order_idx" ON "nvs_galleries"("organization_id", "is_active", "display_order");
CREATE INDEX "nvs_galleries_organization_id_is_default_idx" ON "nvs_galleries"("organization_id", "is_default");
CREATE INDEX "nvs_galleries_is_deleted_idx" ON "nvs_galleries"("is_deleted");
CREATE UNIQUE INDEX "nvs_galleries_one_default_per_organization" ON "nvs_galleries"("organization_id") WHERE "is_default" = true AND "is_deleted" = false;

ALTER TABLE "nvs_galleries" ADD CONSTRAINT "nvs_galleries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_galleries" ADD CONSTRAINT "nvs_galleries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_galleries" ADD CONSTRAINT "nvs_galleries_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_galleries" ADD CONSTRAINT "nvs_galleries_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "nvs_gallery_images" ADD COLUMN "gallery_id" INTEGER;

INSERT INTO "nvs_galleries" ("organization_id", "title_english", "title_hindi", "is_default", "visible_to_all")
SELECT "organization_id", 'Default Gallery', 'डिफ़ॉल्ट गैलरी', true,
       COALESCE(BOOL_OR("visible_to_all"), false)
FROM "nvs_gallery_images"
GROUP BY "organization_id";

UPDATE "nvs_gallery_images" AS image
SET "gallery_id" = gallery."id"
FROM "nvs_galleries" AS gallery
WHERE gallery."organization_id" = image."organization_id"
  AND gallery."is_default" = true;

CREATE INDEX "nvs_gallery_images_gallery_id_idx" ON "nvs_gallery_images"("gallery_id");
ALTER TABLE "nvs_gallery_images" ADD CONSTRAINT "nvs_gallery_images_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "nvs_galleries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
DROP INDEX IF EXISTS "nvs_gallery_images_organization_id_visible_to_all_idx";
ALTER TABLE "nvs_gallery_images" DROP COLUMN "visible_to_all";
