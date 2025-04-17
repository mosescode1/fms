/*
  Warnings:

  - You are about to drop the column `membersId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `membersId` on the `Files` table. All the data in the column will be lost.
  - You are about to drop the column `membersId` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the `Members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_membersId_fkey";

-- DropForeignKey
ALTER TABLE "Files" DROP CONSTRAINT "Files_membersId_fkey";

-- DropForeignKey
ALTER TABLE "Members" DROP CONSTRAINT "Members_userId_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_membersId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "membersId",
ADD COLUMN     "usersId" TEXT;

-- AlterTable
ALTER TABLE "Files" DROP COLUMN "membersId";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "membersId",
ADD COLUMN     "usersId" TEXT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "parentId" TEXT,
ALTER COLUMN "loggedInAs" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "Members";

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
