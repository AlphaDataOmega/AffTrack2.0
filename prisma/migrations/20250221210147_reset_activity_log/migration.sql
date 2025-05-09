/*
  Warnings:

  - The `details` column on the `ActivityLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `action` on the `ActivityLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "context" TEXT,
ADD COLUMN     "contextId" TEXT,
DROP COLUMN "action",
ADD COLUMN     "action" TEXT NOT NULL,
DROP COLUMN "details",
ADD COLUMN     "details" JSONB;

-- DropEnum
DROP TYPE "ActivityType";

-- CreateIndex
CREATE INDEX "ActivityLog_context_contextId_idx" ON "ActivityLog"("context", "contextId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");
