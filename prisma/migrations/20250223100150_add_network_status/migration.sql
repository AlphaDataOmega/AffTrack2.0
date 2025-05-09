-- CreateEnum
CREATE TYPE "NetworkStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DELETED');

-- AlterTable
ALTER TABLE "AdNetwork" ADD COLUMN     "status" "NetworkStatus" NOT NULL DEFAULT 'ACTIVE';
