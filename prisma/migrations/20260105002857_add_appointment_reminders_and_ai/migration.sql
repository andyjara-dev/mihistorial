-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "encryptedEmailData" TEXT,
ADD COLUMN IF NOT EXISTS "emailEncryptionIv" TEXT,
ADD COLUMN IF NOT EXISTS "sourceType" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS "reminder1Sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "reminder1SentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "reminder2Sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "reminder2SentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "sendReminders" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_reminder1Sent_reminder2Sent_idx" ON "Appointment"("reminder1Sent", "reminder2Sent");
