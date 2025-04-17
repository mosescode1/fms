/*
  Warnings:

  - Added the required column `encoding` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "encoding" VARCHAR(255) NOT NULL;
