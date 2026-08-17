-- CreateTable
CREATE TABLE "nvs_districts" (
    "id" INTEGER NOT NULL,
    "district_name" VARCHAR(255) NOT NULL,
    "district_code" VARCHAR(20) NOT NULL,
    "state_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "language_id" INTEGER,
    "old_district_code" VARCHAR(20),
    "old_district_name" VARCHAR(255),
    "ro_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nvs_districts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nvs_districts_district_code_idx" ON "nvs_districts"("district_code");

-- CreateIndex
CREATE INDEX "nvs_districts_state_id_is_active_idx" ON "nvs_districts"("state_id", "is_active");

-- CreateIndex
CREATE INDEX "nvs_districts_ro_id_is_active_idx" ON "nvs_districts"("ro_id", "is_active");

-- AddForeignKey
ALTER TABLE "nvs_districts" ADD CONSTRAINT "nvs_districts_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "nvs_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
