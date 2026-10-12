CREATE TYPE "PageSynchronizationScope" AS ENUM ('ORGANIZATION', 'ORGANIZATION_TYPE');
CREATE TYPE "PageSynchronizationStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED');

CREATE TABLE "nvs_page_synchronization_jobs" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scope" "PageSynchronizationScope" NOT NULL,
    "status" "PageSynchronizationStatus" NOT NULL DEFAULT 'PENDING',
    "organization_id" INTEGER,
    "organization_type_id" INTEGER,
    "total_organizations" INTEGER NOT NULL DEFAULT 0,
    "processed_organizations" INTEGER NOT NULL DEFAULT 0,
    "created_pages" INTEGER NOT NULL DEFAULT 0,
    "skipped_pages" INTEGER NOT NULL DEFAULT 0,
    "failed_organizations" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "requested_by" INTEGER NOT NULL,
    CONSTRAINT "nvs_page_synchronization_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "nvs_page_synchronization_failures" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "error_message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "nvs_page_synchronization_failures_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nvs_page_synchronization_jobs_uuid_key" ON "nvs_page_synchronization_jobs"("uuid");
CREATE INDEX "nvs_page_synchronization_jobs_status_created_at_idx" ON "nvs_page_synchronization_jobs"("status", "created_at");
CREATE INDEX "nvs_page_synchronization_jobs_organization_id_idx" ON "nvs_page_synchronization_jobs"("organization_id");
CREATE INDEX "nvs_page_synchronization_jobs_organization_type_id_idx" ON "nvs_page_synchronization_jobs"("organization_type_id");
CREATE INDEX "nvs_page_synchronization_jobs_requested_by_idx" ON "nvs_page_synchronization_jobs"("requested_by");
CREATE UNIQUE INDEX "nvs_page_synchronization_failures_uuid_key" ON "nvs_page_synchronization_failures"("uuid");
CREATE UNIQUE INDEX "nvs_page_synchronization_failures_job_id_organization_id_key" ON "nvs_page_synchronization_failures"("job_id", "organization_id");
CREATE INDEX "nvs_page_synchronization_failures_organization_id_idx" ON "nvs_page_synchronization_failures"("organization_id");

ALTER TABLE "nvs_page_synchronization_jobs" ADD CONSTRAINT "nvs_page_synchronization_jobs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_page_synchronization_jobs" ADD CONSTRAINT "nvs_page_synchronization_jobs_organization_type_id_fkey" FOREIGN KEY ("organization_type_id") REFERENCES "nvs_organization_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_page_synchronization_jobs" ADD CONSTRAINT "nvs_page_synchronization_jobs_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "nvs_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nvs_page_synchronization_failures" ADD CONSTRAINT "nvs_page_synchronization_failures_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "nvs_page_synchronization_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "nvs_page_synchronization_failures" ADD CONSTRAINT "nvs_page_synchronization_failures_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "nvs_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
