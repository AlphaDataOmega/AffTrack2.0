/*
  Warnings:

  - Made the column `email` on table `Affiliate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Affiliate" ALTER COLUMN "email" SET NOT NULL;
