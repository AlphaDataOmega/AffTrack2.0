/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'USER_LOGIN';
ALTER TYPE "ActivityType" ADD VALUE 'USER_LOGOUT';
ALTER TYPE "ActivityType" ADD VALUE 'USER_CREATE';
ALTER TYPE "ActivityType" ADD VALUE 'USER_UPDATE';
ALTER TYPE "ActivityType" ADD VALUE 'USER_DELETE';
ALTER TYPE "ActivityType" ADD VALUE 'USER_SUSPEND';
ALTER TYPE "ActivityType" ADD VALUE 'USER_APPROVE';
ALTER TYPE "ActivityType" ADD VALUE 'PROPERTY_CREATE';
ALTER TYPE "ActivityType" ADD VALUE 'PROPERTY_UPDATE';
ALTER TYPE "ActivityType" ADD VALUE 'PROPERTY_DELETE';

-- DropForeignKey
ALTER TABLE "AdNetwork" DROP CONSTRAINT "AdNetwork_userId_fkey";

-- DropForeignKey
ALTER TABLE "Affiliate" DROP CONSTRAINT "Affiliate_userId_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_teamId_fkey";

-- DropIndex
DROP INDEX "AdNetwork_userId_idx";

-- DropIndex
DROP INDEX "Affiliate_userId_idx";

-- DropIndex
DROP INDEX "Campaign_userId_idx";

-- AlterTable
ALTER TABLE "AdNetwork" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Affiliate" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Campaign" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
DROP COLUMN "teamId",
ADD COLUMN     "lastLoginAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Team";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'PENDING',
    "tags" TEXT[],
    "industry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PropertyToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PropertyToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AdNetworkToProperty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AdNetworkToProperty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AffiliateToProperty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AffiliateToProperty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CampaignToProperty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CampaignToProperty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_domain_key" ON "Property"("domain");

-- CreateIndex
CREATE INDEX "_PropertyToUser_B_index" ON "_PropertyToUser"("B");

-- CreateIndex
CREATE INDEX "_AdNetworkToProperty_B_index" ON "_AdNetworkToProperty"("B");

-- CreateIndex
CREATE INDEX "_AffiliateToProperty_B_index" ON "_AffiliateToProperty"("B");

-- CreateIndex
CREATE INDEX "_CampaignToProperty_B_index" ON "_CampaignToProperty"("B");

-- AddForeignKey
ALTER TABLE "AdNetwork" ADD CONSTRAINT "AdNetwork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliate" ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToUser" ADD CONSTRAINT "_PropertyToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToUser" ADD CONSTRAINT "_PropertyToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdNetworkToProperty" ADD CONSTRAINT "_AdNetworkToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "AdNetwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdNetworkToProperty" ADD CONSTRAINT "_AdNetworkToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AffiliateToProperty" ADD CONSTRAINT "_AffiliateToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AffiliateToProperty" ADD CONSTRAINT "_AffiliateToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToProperty" ADD CONSTRAINT "_CampaignToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToProperty" ADD CONSTRAINT "_CampaignToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
