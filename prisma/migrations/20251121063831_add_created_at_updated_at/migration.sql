-- AlterTable
ALTER TABLE "Concert" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updateBy" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdBy" TEXT;
