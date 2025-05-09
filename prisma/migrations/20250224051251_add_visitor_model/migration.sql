/*
  Warnings:

  - You are about to drop the column `destinations` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "destinations",
ADD COLUMN     "adNetworkId" TEXT,
ADD COLUMN     "affiliateId" TEXT,
ALTER COLUMN "destinationType" SET DEFAULT 'SINGLE',
ALTER COLUMN "distribution" SET DEFAULT 'EVEN';

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION,
    "cr" DOUBLE PRECISION,
    "epc" DOUBLE PRECISION,
    "rpc" DOUBLE PRECISION,
    "campaignId" TEXT NOT NULL,
    "testStartedAt" TIMESTAMP(3),
    "testEndedAt" TIMESTAMP(3),

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationRule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "field" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,

    CONSTRAINT "DestinationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "destinationId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "language" TEXT,
    "subId" TEXT,
    "clickId" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "metaData" JSONB,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Destination_campaignId_idx" ON "Destination"("campaignId");

-- CreateIndex
CREATE INDEX "DestinationRule_destinationId_idx" ON "DestinationRule"("destinationId");

-- CreateIndex
CREATE INDEX "Visitor_campaignId_idx" ON "Visitor"("campaignId");

-- CreateIndex
CREATE INDEX "Visitor_sourceType_sourceId_idx" ON "Visitor"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Visitor_destinationId_idx" ON "Visitor"("destinationId");

-- CreateIndex
CREATE INDEX "Visitor_subId_idx" ON "Visitor"("subId");

-- CreateIndex
CREATE INDEX "Visitor_clickId_idx" ON "Visitor"("clickId");

-- CreateIndex
CREATE INDEX "Visitor_country_idx" ON "Visitor"("country");

-- CreateIndex
CREATE INDEX "Visitor_createdAt_idx" ON "Visitor"("createdAt");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_adNetworkId_fkey" FOREIGN KEY ("adNetworkId") REFERENCES "AdNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationRule" ADD CONSTRAINT "DestinationRule_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
