CREATE TYPE "PageSynchronizationItemStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

ALTER TABLE "nvs_page_synchronization_jobs"
  ADD COLUMN "worker_lock" INTEGER;

CREATE UNIQUE INDEX "nvs_page_synchronization_jobs_worker_lock_key"
  ON "nvs_page_synchronization_jobs"("worker_lock");

ALTER TABLE "nvs_page_synchronization_failures"
  RENAME TO "nvs_page_synchronization_items";

ALTER TABLE "nvs_page_synchronization_items"
  RENAME CONSTRAINT "nvs_page_synchronization_failures_pkey"
  TO "nvs_page_synchronization_items_pkey";
ALTER TABLE "nvs_page_synchronization_items"
  RENAME CONSTRAINT "nvs_page_synchronization_failures_job_id_fkey"
  TO "nvs_page_synchronization_items_job_id_fkey";
ALTER TABLE "nvs_page_synchronization_items"
  RENAME CONSTRAINT "nvs_page_synchronization_failures_organization_id_fkey"
  TO "nvs_page_synchronization_items_organization_id_fkey";

ALTER INDEX "nvs_page_synchronization_failures_uuid_key"
  RENAME TO "nvs_page_synchronization_items_uuid_key";
ALTER INDEX "nvs_page_synchronization_failures_job_id_organization_id_key"
  RENAME TO "nvs_page_synchronization_items_job_id_organization_id_key";
ALTER INDEX "nvs_page_synchronization_failures_organization_id_idx"
  RENAME TO "nvs_page_synchronization_items_organization_id_idx";

ALTER TABLE "nvs_page_synchronization_items"
  ADD COLUMN "status" "PageSynchronizationItemStatus" NOT NULL DEFAULT 'FAILED',
  ADD COLUMN "created_pages" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "skipped_pages" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "started_at" TIMESTAMP(3),
  ADD COLUMN "completed_at" TIMESTAMP(3),
  ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "nvs_page_synchronization_items"
  ALTER COLUMN "error_message" DROP NOT NULL;

UPDATE "nvs_page_synchronization_items"
SET "completed_at" = "created_at",
    "updated_at" = "created_at";

ALTER TABLE "nvs_page_synchronization_items"
  ALTER COLUMN "updated_at" SET NOT NULL,
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE INDEX "nvs_page_synchronization_items_job_id_status_idx"
  ON "nvs_page_synchronization_items"("job_id", "status");

UPDATE "nvs_page_synchronization_jobs"
SET "status" = 'FAILED',
    "error_message" = 'Synchronization job must be rerun after reliability upgrade.',
    "completed_at" = CURRENT_TIMESTAMP,
    "worker_lock" = NULL
WHERE "status" IN ('PENDING', 'RUNNING');
