-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "countries" TEXT[],
    "devices" TEXT[],
    "browsers" TEXT[],
    "languages" TEXT[],
    "destinationType" TEXT NOT NULL,
    "distribution" TEXT NOT NULL,
    "destinations" JSONB NOT NULL,
    "rules" JSONB,
    "campaignType" TEXT NOT NULL,
    "bidAmount" DOUBLE PRECISION,
    "targetCpa" DOUBLE PRECISION,
    "daily" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "dailyUnlimited" BOOLEAN NOT NULL DEFAULT false,
    "totalUnlimited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campaign_userId_idx" ON "Campaign"("userId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
