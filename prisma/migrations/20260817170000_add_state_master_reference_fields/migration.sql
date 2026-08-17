ALTER TABLE "nvs_states"
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "ro_id" INTEGER,
  ADD COLUMN "iso_code" VARCHAR(20);

UPDATE "nvs_states"
SET "iso_code" = CONCAT('LEGACY-', "id")
WHERE "iso_code" IS NULL;

ALTER TABLE "nvs_states"
  ALTER COLUMN "iso_code" SET NOT NULL;

CREATE UNIQUE INDEX "nvs_states_iso_code_key" ON "nvs_states"("iso_code");
CREATE INDEX "nvs_states_ro_id_is_active_idx" ON "nvs_states"("ro_id", "is_active");
CREATE INDEX "nvs_states_iso_code_idx" ON "nvs_states"("iso_code");
