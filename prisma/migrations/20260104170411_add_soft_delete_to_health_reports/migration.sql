-- AlterTable
ALTER TABLE "HealthReport" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "HealthReport_deletedAt_idx" ON "HealthReport"("deletedAt");
