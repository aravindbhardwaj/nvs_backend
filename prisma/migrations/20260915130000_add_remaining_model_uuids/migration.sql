-- Apply before deploying the UUID-aware application. Requires gen_random_uuid().
-- Atomic migration: numeric keys and relationships are preserved.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE "nvs_regions" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_regions" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_regions" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_regions" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_regions_uuid_key" ON "nvs_regions"("uuid");

ALTER TABLE "nvs_states" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_states" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_states" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_states" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_states_uuid_key" ON "nvs_states"("uuid");

ALTER TABLE "nvs_districts" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_districts" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_districts" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_districts" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_districts_uuid_key" ON "nvs_districts"("uuid");

ALTER TABLE "nvs_organization_types" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_organization_types" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_organization_types" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_organization_types" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_organization_types_uuid_key" ON "nvs_organization_types"("uuid");

ALTER TABLE "nvs_organizations" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_organizations" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_organizations" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_organizations" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_organizations_uuid_key" ON "nvs_organizations"("uuid");

ALTER TABLE "nvs_users" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_users" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_users" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_users" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_users_uuid_key" ON "nvs_users"("uuid");

ALTER TABLE "nvs_refresh_tokens" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_refresh_tokens" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_refresh_tokens" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_refresh_tokens" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_refresh_tokens_uuid_key" ON "nvs_refresh_tokens"("uuid");

ALTER TABLE "nvs_content_types" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_content_types" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_content_types" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_content_types" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_content_types_uuid_key" ON "nvs_content_types"("uuid");

ALTER TABLE "nvs_pages" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_pages" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_pages" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_pages" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_pages_uuid_key" ON "nvs_pages"("uuid");

ALTER TABLE "nvs_media" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_media" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_media" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_media" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_media_uuid_key" ON "nvs_media"("uuid");

ALTER TABLE "nvs_banners" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_banners" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_banners" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_banners" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_banners_uuid_key" ON "nvs_banners"("uuid");

ALTER TABLE "nvs_modals" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_modals" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_modals" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_modals" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_modals_uuid_key" ON "nvs_modals"("uuid");

ALTER TABLE "nvs_gallery_images" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_gallery_images" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_gallery_images" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_gallery_images" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_gallery_images_uuid_key" ON "nvs_gallery_images"("uuid");

ALTER TABLE "nvs_leaders" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_leaders" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_leaders" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_leaders" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_leaders_uuid_key" ON "nvs_leaders"("uuid");

ALTER TABLE "nvs_jnv_principals" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_jnv_principals" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_jnv_principals" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_jnv_principals" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_jnv_principals_uuid_key" ON "nvs_jnv_principals"("uuid");

ALTER TABLE "nvs_menus" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_menus" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_menus" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_menus" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_menus_uuid_key" ON "nvs_menus"("uuid");

ALTER TABLE "visitor_sessions" ADD COLUMN "uuid" UUID;
ALTER TABLE "visitor_sessions" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "visitor_sessions" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "visitor_sessions" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "visitor_sessions_uuid_key" ON "visitor_sessions"("uuid");

ALTER TABLE "nvs_permissions" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_permissions" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_permissions" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_permissions" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_permissions_uuid_key" ON "nvs_permissions"("uuid");

ALTER TABLE "nvs_role_permissions" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_role_permissions" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_role_permissions" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_role_permissions" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_role_permissions_uuid_key" ON "nvs_role_permissions"("uuid");

ALTER TABLE "nvs_user_permissions" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_user_permissions" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_user_permissions" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_user_permissions" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_user_permissions_uuid_key" ON "nvs_user_permissions"("uuid");

ALTER TABLE "nvs_audit_logs" ADD COLUMN "uuid" UUID;
ALTER TABLE "nvs_audit_logs" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();
UPDATE "nvs_audit_logs" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;
ALTER TABLE "nvs_audit_logs" ALTER COLUMN "uuid" SET NOT NULL;
CREATE UNIQUE INDEX "nvs_audit_logs_uuid_key" ON "nvs_audit_logs"("uuid");

COMMIT;
