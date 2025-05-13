/*
  Warnings:

  - Added the required column `webContentLink` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webViewLink` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "webContentLink" VARCHAR(255) NOT NULL,
ADD COLUMN     "webViewLink" VARCHAR(255) NOT NULL;
