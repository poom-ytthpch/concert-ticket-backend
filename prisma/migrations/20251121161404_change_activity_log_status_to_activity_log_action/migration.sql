/*
  Warnings:

  - Changed the type of `action` on the `ActivityLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ActivityLogAction" AS ENUM ('RESERVE', 'CANCEL');

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "action",
ADD COLUMN     "action" "ActivityLogAction" NOT NULL;

-- DropEnum
DROP TYPE "ActivityLogStatus";
