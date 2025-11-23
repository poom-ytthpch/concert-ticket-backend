-- DropIndex
DROP INDEX "ActivityLog_userId_idx";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "adminId" TEXT;

-- CreateIndex
CREATE INDEX "ActivityLog_userId_adminId_idx" ON "ActivityLog"("userId", "adminId");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
