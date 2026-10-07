CREATE TYPE "ReportCategory" AS ENUM (
  'PAYMENT_ISSUE',
  'COURSE_ACCESS_ISSUE',
  'ASSIGNMENT_ISSUE',
  'QUIZ_ISSUE',
  'INSTRUCTOR_ISSUE',
  'TECHNICAL_ISSUE',
  'OTHER'
);

CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

CREATE TABLE "Report" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "category" "ReportCategory" NOT NULL,
  "subject" VARCHAR(160) NOT NULL,
  "description" TEXT NOT NULL,
  "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
  "adminResponse" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  "resolvedAt" TIMESTAMPTZ(6),

  CONSTRAINT "Report_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Report_userId_createdAt_idx" ON "Report"("userId", "createdAt");
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
