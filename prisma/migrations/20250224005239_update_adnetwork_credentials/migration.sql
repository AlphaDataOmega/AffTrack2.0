/*
  Warnings:

  - You are about to drop the column `reportingEmail` on the `AdNetwork` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdNetwork" DROP COLUMN "reportingEmail",
ADD COLUMN     "loginUrl" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "username" TEXT;
