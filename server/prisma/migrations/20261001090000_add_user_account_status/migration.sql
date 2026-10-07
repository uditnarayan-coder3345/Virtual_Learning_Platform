CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BLOCKED');

ALTER TABLE "User"
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'APPROVED';

-- Existing accounts retain access, and all existing administrators remain approved.
UPDATE "User"
SET "status" = 'APPROVED'
WHERE "role" = 'ADMIN';
