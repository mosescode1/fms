/*
  Warnings:

  - You are about to drop the column `userId` on the `Folders` table. All the data in the column will be lost.
  - Added the required column `usersId` to the `Folders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Folders" DROP CONSTRAINT "Folders_userId_fkey";

-- AlterTable
ALTER TABLE "Folders" DROP COLUMN "userId",
ADD COLUMN     "usersId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
