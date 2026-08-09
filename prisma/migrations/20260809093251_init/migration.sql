-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'HQ', 'RO', 'JNV', 'NLI');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('HEADQUARTERS', 'REGIONAL_OFFICE', 'NLI', 'JNV');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'PUBLISH', 'DOWNLOAD');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('UPLOADED', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'PASSWORD', 'DATE', 'DATETIME', 'SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX', 'FILE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'FAILED_LOGIN', 'LOCK_ACCOUNT', 'UNLOCK_ACCOUNT');

-- CreateTable
CREATE TABLE "nvs_regions" (
    "id" SERIAL NOT NULL,
    "region_code" TEXT NOT NULL,
    "region_name" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_states" (
    "id" SERIAL NOT NULL,
    "state_code" TEXT NOT NULL,
    "state_name" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_organizations" (
    "id" SERIAL NOT NULL,
    "organization_code" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "organization_short_name" TEXT,
    "organization_type" "OrganizationType" NOT NULL,
    "parent_organization_id" INTEGER,
    "region_id" INTEGER,
    "state_id" INTEGER,
    "logo_media_id" INTEGER,
    "address" TEXT,
    "contact_person" TEXT,
    "contact_email" TEXT,
    "contact_mobile" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_users" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "role" "Role" NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "mobile" VARCHAR(20),
    "password_hash" TEXT NOT NULL,
    "password_reset_required" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "nvs_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_permissions" (
    "id" SERIAL NOT NULL,
    "permission_code" TEXT NOT NULL,
    "permission_name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_role_permissions" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nvs_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_user_permissions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "is_allowed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nvs_user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nvs_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" "AuditAction" NOT NULL,
    "module" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" INTEGER,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nvs_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_content_types" (
    "id" SERIAL NOT NULL,
    "content_type_name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_content_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_media_types" (
    "id" SERIAL NOT NULL,
    "media_type_name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_media_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_pages" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "content_type_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_media" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "page_id" INTEGER,
    "media_type_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "original_file_name" TEXT NOT NULL,
    "stored_file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_extension" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "checksum" VARCHAR(255),
    "storage_provider" TEXT,
    "bucket_name" TEXT,
    "status" "MediaStatus" NOT NULL DEFAULT 'UPLOADED',
    "uploaded_by" INTEGER,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_forms" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "form_code" TEXT NOT NULL,
    "form_name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_form_fields" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "field_key" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_type" "FieldType" NOT NULL,
    "placeholder" TEXT,
    "default_value" TEXT,
    "validation_json" JSONB,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_form_data" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "submitted_by" INTEGER,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_form_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nvs_form_data_values" (
    "id" SERIAL NOT NULL,
    "form_data_id" INTEGER NOT NULL,
    "form_field_id" INTEGER NOT NULL,
    "valueText" TEXT,
    "valueJson" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nvs_form_data_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nvs_regions_region_code_key" ON "nvs_regions"("region_code");

-- CreateIndex
CREATE INDEX "nvs_regions_region_name_idx" ON "nvs_regions"("region_name");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_states_state_code_key" ON "nvs_states"("state_code");

-- CreateIndex
CREATE INDEX "nvs_states_state_name_idx" ON "nvs_states"("state_name");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_organizations_organization_code_key" ON "nvs_organizations"("organization_code");

-- CreateIndex
CREATE INDEX "nvs_organizations_organization_type_idx" ON "nvs_organizations"("organization_type");

-- CreateIndex
CREATE INDEX "nvs_organizations_parent_organization_id_idx" ON "nvs_organizations"("parent_organization_id");

-- CreateIndex
CREATE INDEX "nvs_organizations_region_id_idx" ON "nvs_organizations"("region_id");

-- CreateIndex
CREATE INDEX "nvs_organizations_state_id_idx" ON "nvs_organizations"("state_id");

-- CreateIndex
CREATE INDEX "nvs_organizations_organization_code_idx" ON "nvs_organizations"("organization_code");

-- CreateIndex
CREATE INDEX "nvs_organizations_organization_name_idx" ON "nvs_organizations"("organization_name");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_users_email_key" ON "nvs_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_users_mobile_key" ON "nvs_users"("mobile");

-- CreateIndex
CREATE INDEX "nvs_users_organization_id_idx" ON "nvs_users"("organization_id");

-- CreateIndex
CREATE INDEX "nvs_users_role_idx" ON "nvs_users"("role");

-- CreateIndex
CREATE INDEX "nvs_users_status_idx" ON "nvs_users"("status");

-- CreateIndex
CREATE INDEX "nvs_users_email_idx" ON "nvs_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_permissions_permission_code_key" ON "nvs_permissions"("permission_code");

-- CreateIndex
CREATE INDEX "nvs_permissions_module_idx" ON "nvs_permissions"("module");

-- CreateIndex
CREATE INDEX "nvs_permissions_action_idx" ON "nvs_permissions"("action");

-- CreateIndex
CREATE INDEX "nvs_role_permissions_role_idx" ON "nvs_role_permissions"("role");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_role_permissions_role_permission_id_key" ON "nvs_role_permissions"("role", "permission_id");

-- CreateIndex
CREATE INDEX "nvs_user_permissions_user_id_idx" ON "nvs_user_permissions"("user_id");

-- CreateIndex
CREATE INDEX "nvs_user_permissions_permission_id_idx" ON "nvs_user_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_user_permissions_user_id_permission_id_key" ON "nvs_user_permissions"("user_id", "permission_id");

-- CreateIndex
CREATE INDEX "nvs_refresh_tokens_user_id_idx" ON "nvs_refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "nvs_refresh_tokens_expires_at_idx" ON "nvs_refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "nvs_audit_logs_user_id_idx" ON "nvs_audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "nvs_audit_logs_module_idx" ON "nvs_audit_logs"("module");

-- CreateIndex
CREATE INDEX "nvs_audit_logs_entity_name_idx" ON "nvs_audit_logs"("entity_name");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_content_types_content_type_name_key" ON "nvs_content_types"("content_type_name");

-- CreateIndex
CREATE INDEX "nvs_content_types_display_order_idx" ON "nvs_content_types"("display_order");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_media_types_media_type_name_key" ON "nvs_media_types"("media_type_name");

-- CreateIndex
CREATE INDEX "nvs_media_types_display_order_idx" ON "nvs_media_types"("display_order");

-- CreateIndex
CREATE INDEX "nvs_pages_status_idx" ON "nvs_pages"("status");

-- CreateIndex
CREATE INDEX "nvs_pages_organization_id_idx" ON "nvs_pages"("organization_id");

-- CreateIndex
CREATE INDEX "nvs_pages_content_type_id_idx" ON "nvs_pages"("content_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_pages_organization_id_content_type_id_key" ON "nvs_pages"("organization_id", "content_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_pages_organization_id_slug_key" ON "nvs_pages"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "nvs_media_organization_id_idx" ON "nvs_media"("organization_id");

-- CreateIndex
CREATE INDEX "nvs_media_page_id_idx" ON "nvs_media"("page_id");

-- CreateIndex
CREATE INDEX "nvs_media_media_type_id_idx" ON "nvs_media"("media_type_id");

-- CreateIndex
CREATE INDEX "nvs_media_status_idx" ON "nvs_media"("status");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_forms_form_code_key" ON "nvs_forms"("form_code");

-- CreateIndex
CREATE INDEX "nvs_forms_organization_id_idx" ON "nvs_forms"("organization_id");

-- CreateIndex
CREATE INDEX "nvs_forms_status_idx" ON "nvs_forms"("status");

-- CreateIndex
CREATE INDEX "nvs_forms_form_code_idx" ON "nvs_forms"("form_code");

-- CreateIndex
CREATE INDEX "nvs_form_fields_form_id_idx" ON "nvs_form_fields"("form_id");

-- CreateIndex
CREATE INDEX "nvs_form_fields_display_order_idx" ON "nvs_form_fields"("display_order");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_form_fields_form_id_field_key_key" ON "nvs_form_fields"("form_id", "field_key");

-- CreateIndex
CREATE INDEX "nvs_form_data_form_id_idx" ON "nvs_form_data"("form_id");

-- CreateIndex
CREATE INDEX "nvs_form_data_organization_id_idx" ON "nvs_form_data"("organization_id");

-- CreateIndex
CREATE INDEX "nvs_form_data_submitted_by_idx" ON "nvs_form_data"("submitted_by");

-- CreateIndex
CREATE INDEX "nvs_form_data_values_form_data_id_idx" ON "nvs_form_data_values"("form_data_id");

-- CreateIndex
CREATE INDEX "nvs_form_data_values_form_field_id_idx" ON "nvs_form_data_values"("form_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "nvs_form_data_values_form_data_id_form_field_id_key" ON "nvs_form_data_values"("form_data_id", "form_field_id");

-- AddForeignKey
ALTER TABLE "nvs_organizations" ADD CONSTRAINT "nvs_organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "nvs_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_organizations" ADD CONSTRAINT "nvs_organizations_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "nvs_regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_organizations" ADD CONSTRAINT "nvs_organizations_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "nvs_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_users" ADD CONSTRAINT "nvs_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_role_permissions" ADD CONSTRAINT "nvs_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "nvs_permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_user_permissions" ADD CONSTRAINT "nvs_user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "nvs_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_user_permissions" ADD CONSTRAINT "nvs_user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "nvs_permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_refresh_tokens" ADD CONSTRAINT "nvs_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "nvs_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_audit_logs" ADD CONSTRAINT "nvs_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_pages" ADD CONSTRAINT "nvs_pages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_pages" ADD CONSTRAINT "nvs_pages_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "nvs_content_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_media" ADD CONSTRAINT "nvs_media_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_media" ADD CONSTRAINT "nvs_media_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "nvs_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_media" ADD CONSTRAINT "nvs_media_media_type_id_fkey" FOREIGN KEY ("media_type_id") REFERENCES "nvs_media_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_forms" ADD CONSTRAINT "nvs_forms_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_form_fields" ADD CONSTRAINT "nvs_form_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "nvs_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_form_data" ADD CONSTRAINT "nvs_form_data_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "nvs_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_form_data" ADD CONSTRAINT "nvs_form_data_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_form_data" ADD CONSTRAINT "nvs_form_data_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "nvs_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_form_data_values" ADD CONSTRAINT "nvs_form_data_values_form_data_id_fkey" FOREIGN KEY ("form_data_id") REFERENCES "nvs_form_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nvs_form_data_values" ADD CONSTRAINT "nvs_form_data_values_form_field_id_fkey" FOREIGN KEY ("form_field_id") REFERENCES "nvs_form_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
