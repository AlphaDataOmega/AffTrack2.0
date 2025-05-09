/*
  Warnings:

  - You are about to drop the column `companyName` on the `AffiliateNetwork` table. All the data in the column will be lost.
  - You are about to drop the column `propertyIds` on the `AffiliateNetwork` table. All the data in the column will be lost.
  - Added the required column `accountName` to the `AffiliateNetwork` table without a default value.
*/

-- AlterTable
ALTER TABLE "AffiliateNetwork" DROP COLUMN "companyName",
DROP COLUMN "propertyIds",
ADD COLUMN "accountName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_AffiliateNetworkToProperty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AffiliateNetworkToProperty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AffiliateNetworkToProperty_B_index" ON "_AffiliateNetworkToProperty"("B");

-- AddForeignKey
ALTER TABLE "_AffiliateNetworkToProperty" ADD CONSTRAINT "_AffiliateNetworkToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "AffiliateNetwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AffiliateNetworkToProperty" ADD CONSTRAINT "_AffiliateNetworkToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE; 