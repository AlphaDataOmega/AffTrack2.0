/*
  Warnings:

  - You are about to drop the column `context` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `contextId` on the `ActivityLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropIndex
DROP INDEX "ActivityLog_context_contextId_idx";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "context",
DROP COLUMN "contextId",
ADD COLUMN     "propertyId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_propertyId_idx" ON "ActivityLog"("propertyId");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
