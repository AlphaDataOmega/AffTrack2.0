-- AlterEnum
ALTER TYPE "NetworkStatus" ADD VALUE 'ARCHIVED';

-- CreateIndex
CREATE INDEX "AdNetwork_status_idx" ON "AdNetwork"("status");

-- CreateIndex
CREATE INDEX "AdNetwork_network_idx" ON "AdNetwork"("network");
