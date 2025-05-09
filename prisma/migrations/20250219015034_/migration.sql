-- AlterTable
ALTER TABLE "User" ALTER COLUMN "timezone" SET DEFAULT 'America/New_York';

-- CreateTable
CREATE TABLE "AdNetwork" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "network" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "reportingEmail" TEXT NOT NULL,
    "tracking" JSONB,

    CONSTRAINT "AdNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdNetwork_userId_idx" ON "AdNetwork"("userId");

-- AddForeignKey
ALTER TABLE "AdNetwork" ADD CONSTRAINT "AdNetwork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
