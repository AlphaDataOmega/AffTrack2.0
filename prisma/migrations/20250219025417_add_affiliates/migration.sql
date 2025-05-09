-- CreateEnum
CREATE TYPE "AffiliateStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'BLOCKED');

-- CreateTable
CREATE TABLE "Affiliate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "status" "AffiliateStatus" NOT NULL DEFAULT 'PENDING',
    "contactName" TEXT NOT NULL,
    "company" TEXT,
    "website" TEXT,
    "phone" TEXT NOT NULL,
    "skype" TEXT NOT NULL,
    "email" TEXT,
    "payoutType" TEXT NOT NULL DEFAULT 'revshare',
    "payoutValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Affiliate_userId_idx" ON "Affiliate"("userId");

-- AddForeignKey
ALTER TABLE "Affiliate" ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
