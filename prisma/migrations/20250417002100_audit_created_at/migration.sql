/*
  Warnings:

  - You are about to drop the column `creatdAt` on the `AuditLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "creatdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
