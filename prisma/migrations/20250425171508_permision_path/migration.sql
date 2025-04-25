-- CreateTable
CREATE TABLE "PermissionPath" (
    "id" TEXT NOT NULL,
    "type" "PermissionType" NOT NULL,
    "usersId" TEXT NOT NULL,
    "folderId" TEXT,
    "fileId" TEXT,

    CONSTRAINT "PermissionPath_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PermissionPath" ADD CONSTRAINT "PermissionPath_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionPath" ADD CONSTRAINT "PermissionPath_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionPath" ADD CONSTRAINT "PermissionPath_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
