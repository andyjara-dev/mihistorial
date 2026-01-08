-- AlterTable: Agregar campos de metadatos encriptados
-- Hacer campos legacy opcionales

-- MedicalExam
ALTER TABLE "MedicalExam" ADD COLUMN IF NOT EXISTS "encryptedMetadata" TEXT;
ALTER TABLE "MedicalExam" ADD COLUMN IF NOT EXISTS "metadataIv" TEXT;
ALTER TABLE "MedicalExam" ADD COLUMN IF NOT EXISTS "laboratory" TEXT;
ALTER TABLE "MedicalExam" ALTER COLUMN "institution" DROP NOT NULL;

-- Appointment
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "encryptedMetadata" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "metadataIv" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "institution" TEXT;
ALTER TABLE "Appointment" ALTER COLUMN "doctorName" DROP NOT NULL;

-- Document
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "encryptedMetadata" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "metadataIv" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "documentType" TEXT;
ALTER TABLE "Document" ALTER COLUMN "fileName" DROP NOT NULL;
