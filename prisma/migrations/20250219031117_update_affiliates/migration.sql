/*
  Warnings:

  - You are about to drop the column `payoutType` on the `Affiliate` table. All the data in the column will be lost.
  - You are about to drop the column `payoutValue` on the `Affiliate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Affiliate" DROP COLUMN "payoutType",
DROP COLUMN "payoutValue";
