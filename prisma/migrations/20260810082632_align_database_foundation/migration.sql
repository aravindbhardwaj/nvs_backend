/*
  Warnings:

  - The values [HEADQUARTERS] on the enum `OrganizationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ARCHIVED] on the enum `PageStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [HQ,RO] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `entity_name` on the `nvs_audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `old_values` on the `nvs_audit_logs` table. All the data in the column will be lost.
  - You are about to alter the column `module` on the `nvs_audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `ip_address` on the `nvs_audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `content_type_name` on the `nvs_content_types` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `nvs_content_types` table. All the data in the column will be lost.
  - You are about to drop the column `bucket_name` on the `nvs_media` table. All the data in the column will be lost.
  - You are about to drop the column `file_extension` on the `nvs_media` table. All the data in the column will be lost.
  - You are about to drop the column `original_file_name` on the `nvs_media` table. All the data in the column will be lost.
  - You are about to drop the column `page_id` on the `nvs_media` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `nvs_media` table. All the data in the column will be lost.
  - You are about to drop the column `storage_provider` on the `nvs_media` table. All the data in the column will be lost.
  - You are about to drop the column `stored_file_name` on the `nvs_media` table. All the data in the column will be lost.
  - You are about to drop the column `uploaded_by` on the `nvs_media` table. All the data in the column will be lost.
  - You are about to alter the column `file_path` on the `nvs_media` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `mime_type` on the `nvs_media` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `is_active` on the `nvs_media_types` table. All the data in the column will be lost.
  - You are about to drop the column `media_type_name` on the `nvs_media_types` table. All the data in the column will be lost.
  - You are about to drop the column `contact_email` on the `nvs_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `contact_mobile` on the `nvs_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `contact_person` on the `nvs_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `nvs_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `logo_media_id` on the `nvs_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `organization_short_name` on the `nvs_organizations` table. All the data in the column will be lost.
  - You are about to alter the column `organization_code` on the `nvs_organizations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `organization_name` on the `nvs_organizations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `description` on the `nvs_pages` table. All the data in the column will be lost.
  - You are about to drop the column `display_order` on the `nvs_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `nvs_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `permission_code` on the `nvs_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `permission_name` on the `nvs_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `nvs_permissions` table. All the data in the column will be lost.
  - You are about to alter the column `module` on the `nvs_permissions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `ip_address` on the `nvs_refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `token_hash` on the `nvs_refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `nvs_refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `display_order` on the `nvs_regions` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `nvs_regions` table. All the data in the column will be lost.
  - You are about to alter the column `region_code` on the `nvs_regions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `region_name` on the `nvs_regions` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to drop the column `display_order` on the `nvs_states` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `nvs_states` table. All the data in the column will be lost.
  - You are about to alter the column `state_code` on the `nvs_states` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `state_name` on the `nvs_states` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to drop the column `is_allowed` on the `nvs_user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `nvs_users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `nvs_users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `nvs_users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `nvs_users` table. All the data in the column will be lost.
  - You are about to drop the `nvs_form_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nvs_form_data_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nvs_form_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nvs_forms` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `nvs_content_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stored_filename]` on the table `nvs_media` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `nvs_media_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `nvs_pages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[permission_key]` on the table `nvs_permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[region_name]` on the table `nvs_regions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[state_name]` on the table `nvs_states` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entity` to the `nvs_audit_logs` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `nvs_audit_logs` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `action` on the `nvs_audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `nvs_content_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `extension` to the `nvs_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_filename` to the `nvs_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stored_filename` to the `nvs_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `nvs_media_types` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `nvs_pages` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `permission_key` to the `nvs_permissions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `nvs_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `refresh_token` to the `nvs_refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `allowed` to the `nvs_user_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `nvs_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `nvs_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationType_new" AS ENUM ('HEADQUARTER', 'NLI', 'REGIONAL_OFFICE', 'JNV');
ALTER TABLE "nvs_organizations" ALTER COLUMN "organization_type" TYPE "OrganizationType_new" USING ("organization_type"::text::"OrganizationType_new");
ALTER TYPE "OrganizationType" RENAME TO "OrganizationType_old";
ALTER TYPE "OrganizationType_new" RENAME TO "OrganizationType";
DROP TYPE "public"."OrganizationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PageStatus_new" AS ENUM ('DRAFT', 'PUBLISHED');
ALTER TABLE "public"."nvs_pages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "nvs_pages" ALTER COLUMN "status" TYPE "PageStatus_new" USING ("status"::text::"PageStatus_new");
ALTER TYPE "PageStatus" RENAME TO "PageStatus_old";
ALTER TYPE "PageStatus_new" RENAME TO "PageStatus";
DROP TYPE "public"."PageStatus_old";
ALTER TABLE "nvs_pages" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'HEADQUARTER', 'NLI', 'REGIONAL', 'JNV');
ALTER TABLE "nvs_users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "nvs_role_permissions" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "nvs_audit_logs" DROP CONSTRAINT "nvs_audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_form_data" DROP CONSTRAINT "nvs_form_data_form_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_form_data" DROP CONSTRAINT "nvs_form_data_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_form_data" DROP CONSTRAINT "nvs_form_data_submitted_by_fkey";

-- DropForeignKey
ALTER TABLE "nvs_form_data_values" DROP CONSTRAINT "nvs_form_data_values_form_data_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_form_data_values" DROP CONSTRAINT "nvs_form_data_values_form_field_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_form_fields" DROP CONSTRAINT "nvs_form_fields_form_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_forms" DROP CONSTRAINT "nvs_forms_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_media" DROP CONSTRAINT "nvs_media_page_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_organizations" DROP CONSTRAINT "nvs_organizations_parent_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_organizations" DROP CONSTRAINT "nvs_organizations_region_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_organizations" DROP CONSTRAINT "nvs_organizations_state_id_fkey";

-- DropForeignKey
ALTER TABLE "nvs_refresh_tokens" DROP CONSTRAINT "nvs_refresh_tokens_user_id_fkey";

-- DropIndex
DROP INDEX "nvs_audit_logs_entity_name_idx";

-- DropIndex
DROP INDEX "nvs_content_types_content_type_name_key";

-- DropIndex
DROP INDEX "nvs_media_page_id_idx";

-- DropIndex
DROP INDEX "nvs_media_status_idx";

-- DropIndex
DROP INDEX "nvs_media_types_media_type_name_key";

-- DropIndex
DROP INDEX "nvs_organizations_organization_name_idx";

-- DropIndex
DROP INDEX "nvs_pages_organization_id_slug_key";

-- DropIndex
DROP INDEX "nvs_permissions_action_idx";

-- DropIndex
DROP INDEX "nvs_permissions_permission_code_key";

-- DropIndex
DROP INDEX "nvs_regions_region_name_idx";

-- DropIndex
DROP INDEX "nvs_states_state_name_idx";

-- DropIndex
DROP INDEX "nvs_users_email_idx";

-- DropIndex
DROP INDEX "nvs_users_mobile_key";

-- AlterTable
ALTER TABLE "nvs_audit_logs" DROP COLUMN "entity_name",
DROP COLUMN "old_values",
ADD COLUMN     "entity" VARCHAR(100) NOT NULL,
ADD COLUMN     "previous_values" JSONB,
ALTER COLUMN "user_id" SET NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" VARCHAR(100) NOT NULL,
ALTER COLUMN "module" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "ip_address" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "nvs_content_types" DROP COLUMN "content_type_name",
DROP COLUMN "is_active",
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" VARCHAR(150) NOT NULL,
ADD COLUMN     "updated_by" INTEGER;

-- AlterTable
ALTER TABLE "nvs_media" DROP COLUMN "bucket_name",
DROP COLUMN "file_extension",
DROP COLUMN "original_file_name",
DROP COLUMN "page_id",
DROP COLUMN "status",
DROP COLUMN "storage_provider",
DROP COLUMN "stored_file_name",
DROP COLUMN "uploaded_by",
ADD COLUMN     "extension" VARCHAR(20) NOT NULL,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "original_filename" VARCHAR(255) NOT NULL,
ADD COLUMN     "stored_filename" VARCHAR(255) NOT NULL,
ADD COLUMN     "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "file_path" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "mime_type" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "nvs_media_types" DROP COLUMN "is_active",
DROP COLUMN "media_type_name",
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" VARCHAR(150) NOT NULL,
ADD COLUMN     "updated_by" INTEGER;

-- AlterTable
ALTER TABLE "nvs_organizations" DROP COLUMN "contact_email",
DROP COLUMN "contact_mobile",
DROP COLUMN "contact_person",
DROP COLUMN "is_active",
DROP COLUMN "logo_media_id",
DROP COLUMN "organization_short_name",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "organization_code" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "organization_name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "nvs_pages" DROP COLUMN "description",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "short_description" TEXT,
ALTER COLUMN "content" SET NOT NULL;

-- AlterTable
ALTER TABLE "nvs_permissions" DROP COLUMN "display_order",
DROP COLUMN "is_active",
DROP COLUMN "permission_code",
DROP COLUMN "permission_name",
DROP COLUMN "updated_at",
ADD COLUMN     "permission_key" VARCHAR(150) NOT NULL,
ALTER COLUMN "module" SET DATA TYPE VARCHAR(100),
DROP COLUMN "action",
ADD COLUMN     "action" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "nvs_refresh_tokens" DROP COLUMN "ip_address",
DROP COLUMN "token_hash",
DROP COLUMN "user_agent",
ADD COLUMN     "refresh_token" VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE "nvs_regions" DROP COLUMN "display_order",
DROP COLUMN "is_active",
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_by" INTEGER,
ALTER COLUMN "region_code" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "region_name" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "nvs_states" DROP COLUMN "display_order",
DROP COLUMN "is_active",
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_by" INTEGER,
ALTER COLUMN "state_code" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "state_name" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "nvs_user_permissions" DROP COLUMN "is_allowed",
ADD COLUMN     "allowed" BOOLEAN NOT NULL,
ADD COLUMN     "created_by" INTEGER;

-- AlterTable
ALTER TABLE "nvs_users" DROP COLUMN "first_name",
DROP COLUMN "last_login",
DROP COLUMN "last_name",
DROP COLUMN "password_hash",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "name" VARCHAR(150) NOT NULL,
ADD COLUMN     "password" VARCHAR(255) NOT NULL,
ADD COLUMN     "updated_by" INTEGER;

-- DropTable
DROP TABLE "nvs_form_data";

-- DropTable
DROP TABLE "nvs_form_data_values";

-- DropTable
DROP TABLE "nvs_form_fields";

-- DropTable
DROP TABLE "nvs_forms";

-- DropEnum
DROP TYPE "AuditAction";

-- DropEnum
DROP TYPE "FieldType";

-- DropEnum
DROP TYPE "FormStatus";

-- DropEnum
DROP TYPE "MediaStatus";

-- DropEnum
DROP TYPE "PermissionAction";

-- DropEnum
DROP TYPE "SubmissionStatus";

-- CreateIndex
CREATE INDEX "nvs_audit_logs_entity_idx" ON "nvs_audit_logs"("entity");

-- CreateIndex
CREATE INDEX "nvs_audit_logs_entity_id_idx" ON "nvs_audit_logs"("entity_id");

-- CreateIndex
CREATE INDEX "nvs_audit_logs_action_idx" ON "nvs_audit_logs"("action");

-- CreateIndex
CREATE INDEX "nvs_audit_logs_created_at_idx" ON "nvs_audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_content_types_name_key" ON "nvs_content_types"("name");

-- CreateIndex
CREATE INDEX "nvs_content_types_is_deleted_idx" ON "nvs_content_types"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_media_stored_filename_key" ON "nvs_media"("stored_filename");

-- CreateIndex
CREATE INDEX "nvs_media_mime_type_idx" ON "nvs_media"("mime_type");

-- CreateIndex
CREATE INDEX "nvs_media_created_at_idx" ON "nvs_media"("created_at");

-- CreateIndex
CREATE INDEX "nvs_media_is_deleted_idx" ON "nvs_media"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_media_types_name_key" ON "nvs_media_types"("name");

-- CreateIndex
CREATE INDEX "nvs_media_types_is_deleted_idx" ON "nvs_media_types"("is_deleted");

-- CreateIndex
CREATE INDEX "nvs_organizations_is_deleted_idx" ON "nvs_organizations"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_pages_slug_key" ON "nvs_pages"("slug");

-- CreateIndex
CREATE INDEX "nvs_pages_display_order_idx" ON "nvs_pages"("display_order");

-- CreateIndex
CREATE INDEX "nvs_pages_is_deleted_idx" ON "nvs_pages"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_permissions_permission_key_key" ON "nvs_permissions"("permission_key");

-- CreateIndex
CREATE INDEX "nvs_permissions_permission_key_idx" ON "nvs_permissions"("permission_key");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_regions_region_name_key" ON "nvs_regions"("region_name");

-- CreateIndex
CREATE INDEX "nvs_regions_region_code_idx" ON "nvs_regions"("region_code");

-- CreateIndex
CREATE INDEX "nvs_regions_is_deleted_idx" ON "nvs_regions"("is_deleted");

-- CreateIndex
CREATE INDEX "nvs_role_permissions_permission_id_idx" ON "nvs_role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_states_state_name_key" ON "nvs_states"("state_name");

-- CreateIndex
CREATE INDEX "nvs_states_state_code_idx" ON "nvs_states"("state_code");

-- CreateIndex
CREATE INDEX "nvs_states_is_deleted_idx" ON "nvs_states"("is_deleted");

-- CreateIndex
CREATE INDEX "nvs_users_is_deleted_idx" ON "nvs_users"("is_deleted");

-- AddForeignKey
ALTER TABLE "nvs_regions" ADD CONSTRAINT "nvs_regions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_regions" ADD CONSTRAINT "nvs_regions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_regions" ADD CONSTRAINT "nvs_regions_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_states" ADD CONSTRAINT "nvs_states_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_states" ADD CONSTRAINT "nvs_states_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_states" ADD CONSTRAINT "nvs_states_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_organizations" ADD CONSTRAINT "nvs_organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_organizations" ADD CONSTRAINT "nvs_organizations_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "nvs_regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_organizations" ADD CONSTRAINT "nvs_organizations_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "nvs_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_organizations" ADD CONSTRAINT "nvs_organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_organizations" ADD CONSTRAINT "nvs_organizations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_organizations" ADD CONSTRAINT "nvs_organizations_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_users" ADD CONSTRAINT "nvs_users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_users" ADD CONSTRAINT "nvs_users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_users" ADD CONSTRAINT "nvs_users_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_refresh_tokens" ADD CONSTRAINT "nvs_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "nvs_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_content_types" ADD CONSTRAINT "nvs_content_types_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_content_types" ADD CONSTRAINT "nvs_content_types_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_content_types" ADD CONSTRAINT "nvs_content_types_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_media_types" ADD CONSTRAINT "nvs_media_types_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_media_types" ADD CONSTRAINT "nvs_media_types_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_media_types" ADD CONSTRAINT "nvs_media_types_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_pages" ADD CONSTRAINT "nvs_pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_pages" ADD CONSTRAINT "nvs_pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_pages" ADD CONSTRAINT "nvs_pages_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_media" ADD CONSTRAINT "nvs_media_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_media" ADD CONSTRAINT "nvs_media_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_media" ADD CONSTRAINT "nvs_media_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_user_permissions" ADD CONSTRAINT "nvs_user_permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_audit_logs" ADD CONSTRAINT "nvs_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "nvs_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
