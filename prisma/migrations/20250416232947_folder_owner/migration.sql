/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Folders` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Folders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Folders" DROP CONSTRAINT "Folders_ownerId_fkey";

-- AlterTable
ALTER TABLE "Folders" DROP COLUMN "ownerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
