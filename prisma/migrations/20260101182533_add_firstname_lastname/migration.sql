-- AlterTable: Add firstName and lastName columns to User table
-- These are required fields for patient identity verification

-- Add columns as nullable first
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

-- For existing users, split the 'name' field or set default values
-- If name exists, try to split it into firstName and lastName
UPDATE "User"
SET
  "firstName" = CASE
    WHEN "name" IS NOT NULL AND "name" != '' THEN
      SPLIT_PART("name", ' ', 1)
    ELSE
      'Usuario'
  END,
  "lastName" = CASE
    WHEN "name" IS NOT NULL AND "name" != '' AND ARRAY_LENGTH(STRING_TO_ARRAY("name", ' '), 1) > 1 THEN
      SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
    ELSE
      'Sistema'
  END
WHERE "firstName" IS NULL OR "lastName" IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;
