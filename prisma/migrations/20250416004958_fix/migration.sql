/*
  Warnings:

  - Made the column `usersId` on table `Files` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Files" DROP CONSTRAINT "Files_usersId_fkey";

-- AlterTable
ALTER TABLE "Files" ALTER COLUMN "usersId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
