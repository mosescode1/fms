import {prisma} from "../../prisma/prisma.client";
import audit_logService from "../../service/auditLog/audit_log.service";

class fileRepository {


    private async buildFullPath(folderId: string): Promise<string> {
        const segments: string[] = [];

        let current = await prisma.folders.findUnique({
            where: { id: folderId },
            select: { name: true, parentId: true },
        });

        while (current) {
            segments.unshift(current.name); // Add current folder to the front
            if (!current.parentId) break;   // If no parent, it's the root — stop here
            current = await prisma.folders.findUnique({
                where: { id: current.parentId },
                select: { name: true, parentId: true },
            });
        }

        return '/' + segments.join('/');
    }

    private async updateFullPathRecursively(folderId: string): Promise<void> {
        const fullPath = await this.buildFullPath(folderId);

        // 1. Update this folder
        await prisma.folders.update({
            where: { id: folderId },
            data: { fullPath },
        });

        // 2. Update all files directly in this folder
        await prisma.files.updateMany({
            where: { folderId },
            data: {
                filePath: fullPath,
            }, // assuming file has a fullPath field
        });

        // 3. Get and recursively update all child folders
        const children = await prisma.folders.findMany({
            where: { parentId: folderId },
            select: { id: true },
        });

        for (const child of children) {
            await this.updateFullPathRecursively(child.id);
        }
    }

    async  buildFileFullPath(fileId: string): Promise<string> {
        const file = await prisma.files.findUnique({
            where: { id: fileId },
            select: { fileName: true, folderId: true },
        });

        if (!file) throw new Error("File not found");

        if (!file.folderId) return '/' + file.fileName;

        const folderPath = await this.buildFullPath(file.folderId);
        return `${folderPath}/${file.fileName}`;
    }


    async createFile(fileData: any): Promise<any> {
        console.log("fileData", fileData)
        try{
            // Create the file in the database
            const file = await prisma.files.create({
                data: {
                    fileName: fileData.name,
                    fileType: fileData.mimetype,
                    fileSize: fileData.size,
                    filePath: "", // temporary file path
                    encoding: fileData.encoding,
                    usersId: fileData.userId,
                    folderId: fileData.folderId,
                }
            })

            // TODO: update the file path
            const fullPath = await this.buildFileFullPath(file.id);
            const updatedFile = await prisma.files.update({
                where: { id: file.id },
                data: {
                    filePath: fullPath,
                },
            })

            // TODO: upload the file to the remote server



            // TODO: add the file to the audit log
            const auditLogData = {
                action: "CREATE",
                fileId: file.id,
                usersId: file.usersId,
                folderId: file.folderId,
            }
            await audit_logService.createAuditLog(auditLogData)
            return updatedFile;

        }catch (error:any){
            throw new Error(error.message);
        }

    }


    async createFolder(folderData: any): Promise<any> {
        const { folderName, parentId, userId } = folderData;

        try {
            const folder = await prisma.folders.create({
                data: {
                    name: folderName,
                    parentId: parentId ?? null,
                    usersId: userId,
                    fullPath: '', // temporary
                },
            });

            // Update fullPath
            const fullPath = await this.buildFullPath(folder.id);
            const updatedFolder =  await prisma.folders.update({
                where: { id: folder.id },
                data: {
                    fullPath:fullPath,
                },
            });

            // TODO: add the folder to the audit log
            const auditLogData = {
                action: "CREATE",
                folderId: folder.id,
                usersId: userId,
            }
            await audit_logService.createAuditLog(auditLogData)

            return updatedFolder;
        } catch (err) {
           throw new Error("failed ")
        }
    }

    async renameOrMoveFolder(folderData:any): Promise<any> {
        const { name, newParentId, id } = folderData;

        try {
            const folder = await prisma.folders.update({
                where: { id },
                data: {
                    name,
                    parentId: newParentId ?? undefined,
                },
            });

            // Update path for folder and descendants
            await this.updateFullPathRecursively(folder.id);
            return folder
        } catch (err) {
            throw new Error("failed to rename or move folder")
        }
    }

    async allFiles(): Promise<any[]> {
        try {
            return await prisma.files.findMany({
                orderBy:{
                    uploadedAt: 'desc'
                }
            })
        }catch (error:any){
            throw new Error(error.message);
        }
    }


    async allFolders(): Promise<any[]> {
        // Simulate fetching all folders from a database
       try{
            return await prisma.folders.findMany({
                where:{
                    parentId: null,
                }
            });
       }catch (error:any){
              throw new Error(error.message);
       }
    }

    async getFolderById(folderId: string): Promise<any> {
        try {
            return await prisma.folders.findUnique({
                where: { id: folderId },
                include: {
                    files: true,
                    children: true,
                },
            });
        } catch (error:any) {
            throw new Error(error.message);
        }
    }


    async getFileById(fileId: string): Promise<any> {
        try {
            return await prisma.files.findUnique({
                where: { id: fileId },
            });
        } catch (error:any) {
            throw new Error(error.message);
        }
    }

}


const fileRepo = new fileRepository();
export default fileRepo;