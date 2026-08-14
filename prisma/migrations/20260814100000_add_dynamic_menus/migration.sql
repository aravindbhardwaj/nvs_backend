ALTER TABLE "nvs_content_types" ADD COLUMN "code" VARCHAR(100);
ALTER TABLE "nvs_media_types" ADD COLUMN "code" VARCHAR(100);

CREATE UNIQUE INDEX "nvs_content_types_code_key" ON "nvs_content_types"("code");
CREATE UNIQUE INDEX "nvs_media_types_code_key" ON "nvs_media_types"("code");

CREATE TABLE "nvs_menus" (
    "id" SERIAL NOT NULL,
    "organization_type_id" INTEGER NOT NULL,
    "menu_location" INTEGER NOT NULL,
    "parent_menu_id" INTEGER,
    "title_english" VARCHAR(255) NOT NULL,
    "title_hindi" VARCHAR(255),
    "content_type_id" INTEGER,
    "media_type_id" INTEGER,
    "external_url" VARCHAR(2048),
    "link_target" INTEGER NOT NULL DEFAULT 1,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    CONSTRAINT "nvs_menus_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nvs_menus_organization_type_id_menu_location_parent_menu_id_display_order_idx"
  ON "nvs_menus"("organization_type_id", "menu_location", "parent_menu_id", "display_order");
CREATE INDEX "nvs_menus_content_type_id_idx" ON "nvs_menus"("content_type_id");
CREATE INDEX "nvs_menus_media_type_id_idx" ON "nvs_menus"("media_type_id");
CREATE INDEX "nvs_menus_is_active_idx" ON "nvs_menus"("is_active");
CREATE INDEX "nvs_menus_is_deleted_idx" ON "nvs_menus"("is_deleted");

ALTER TABLE "nvs_menus" ADD CONSTRAINT "nvs_menus_organization_type_id_fkey"
  FOREIGN KEY ("organization_type_id") REFERENCES "nvs_organization_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_menus" ADD CONSTRAINT "nvs_menus_parent_menu_id_fkey"
  FOREIGN KEY ("parent_menu_id") REFERENCES "nvs_menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_menus" ADD CONSTRAINT "nvs_menus_content_type_id_fkey"
  FOREIGN KEY ("content_type_id") REFERENCES "nvs_content_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_menus" ADD CONSTRAINT "nvs_menus_media_type_id_fkey"
  FOREIGN KEY ("media_type_id") REFERENCES "nvs_media_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_menus" ADD CONSTRAINT "nvs_menus_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_menus" ADD CONSTRAINT "nvs_menus_updated_by_fkey"
  FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "nvs_menus" ADD CONSTRAINT "nvs_menus_deleted_by_fkey"
  FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
