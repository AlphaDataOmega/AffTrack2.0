-- CreateTable
CREATE TABLE "AffiliateNetwork" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "contact" JSONB NOT NULL,
    "platform" JSONB NOT NULL,
    "paymentTerms" JSONB NOT NULL,
    "propertyIds" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AffiliateNetwork_name_idx" ON "AffiliateNetwork"("name");

-- AddForeignKey
ALTER TABLE "AffiliateNetwork" ADD CONSTRAINT "AffiliateNetwork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
