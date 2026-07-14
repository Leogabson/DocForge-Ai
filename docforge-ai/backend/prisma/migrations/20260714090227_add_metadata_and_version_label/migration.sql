-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "lastOpenedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "DocumentVersion" ADD COLUMN     "label" TEXT;
