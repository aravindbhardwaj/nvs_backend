ALTER TABLE "nvs_organizations"
  ADD COLUMN "district_id" INTEGER,
  ADD COLUMN "estd_year" INTEGER,
  ADD COLUMN "students_count" INTEGER;

CREATE INDEX "nvs_organizations_district_id_idx"
  ON "nvs_organizations"("district_id");

ALTER TABLE "nvs_organizations"
  ADD CONSTRAINT "nvs_organizations_district_id_fkey"
  FOREIGN KEY ("district_id") REFERENCES "nvs_districts"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
