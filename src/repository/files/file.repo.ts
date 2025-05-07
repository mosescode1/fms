import {prisma} from "../../prisma/prisma.client";
import audit_logService from "../../service/auditLog/audit_log.service";

class fileRepository {
    rootPath = process.env.VM_ROOT_PATH || process.env.SFTP_ROOT_PATH || "/";

    private async buildFullPath(folderId: string): Promise<string> {
        const segments: string[] = [];

        let current = await prisma.folder.findUnique({
            where: { id: folderId },
            select: { name: true, parentId: true },
        });

        while (current) {
            segments.unshift(current.name); // Add current folder to the front
            if (!current.parentId) break;   // If no parent, it's the root — stop here
            current = await prisma.folder.findUnique({
                where: { id: current.parentId },
                select: { name: true, parentId: true },
            });
        }

        return '/' + segments.join('/');
    }

    private async updateFullPathRecursively(folderId: string): Promise<void> {
        const fullPath = await this.buildFullPath(folderId);

        // 1. Update this folder
        await prisma.folder.update({
            where: { id: folderId },
            data: { fullPath },
        });

        // 2. Update all file directly in this folder
        await prisma.file.updateMany({
            where: { folderId },
            data: {
                filePath: fullPath,
            }, // assuming file has a fullPath field
        });

        // 3. Get and recursively update all child folder
        const children = await prisma.folder.findMany({
            where: { parentId: folderId },
            select: { id: true },
        });

        for (const child of children) {
            await this.updateFullPathRecursively(child.id);
        }
    }

    async  buildFileFullPath(fileId: string): Promise<string> {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            select: { fileName: true, folderId: true },
        });

        if (!file) throw new Error("File not found");

        if (!file.folderId) return '/' + file.fileName;

        const folderPath = await this.buildFullPath(file.folderId);
        return `${folderPath}/${file.fileName}`;
    }


    async uploadFile(fileData: any): Promise<any> {
        try{

            // check user creating the file
            const account = await  prisma.account.findFirst(
                {
                    where: {
                        id : fileData.creatorId
                    }
                }
            )



            // Create the file in the database
            const file = await prisma.file.create({
                data: {
                    fileName: fileData.name,
                    fileType: fileData.mimetype,
                    fileSize: fileData.size,
                    filePath: "", // temporary file path
                    encoding: fileData.encoding,
                    accountId: account ? account.id.toString() : null,
                    folderId: fileData.folderId,
                }
            })

            // TODO: update the file path
            const fullPath = this.rootPath + await this.buildFileFullPath(file.id);
            const updatedFile = await prisma.file.update({
                where: { id: file.id },
                data: {
                    filePath: fullPath,
                },
            })

            // TODO: upload the file to the remote server

            // TODO: add the file to the audit log
            const auditLogData = {
                action: "CREATE",
                actorId: file.accountId,
                targetId : file.id,
                targetType: "FILE",
                fileId: file.id,
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
            // find user or member with that id
            const user = await prisma.account.findFirst({
                where:{
                    id: userId,
                }
            })


            const folder = await prisma.folder.create({
                data: {
                    name: folderName,
                    parentId: parentId ?? null,
                    accountId: user ? user.id : null,
                    fullPath: '', // temporary
                },
            });

            // Update fullPath
            const fullPath = this.rootPath +  await this.buildFullPath(folder.id);
            const updatedFolder =  await prisma.folder.update({
                where: { id: folder.id },
                data: {
                    fullPath:fullPath,
                },
            });

            // TODO: add the folder to the audit log
            const auditLogData = {
                action: "CREATE",
                targetId: folder.id,
                actorId: user ? user.id : null,
                targetType: "FOLDER",
                folderId: folder.id,
            }
            await audit_logService.createAuditLog(auditLogData)
            // TODO create folder in the vm root


            return updatedFolder;
        } catch (err) {
           throw new Error("failed ")
        }
    }

    async renameOrMoveFolder(folderData:any): Promise<any> {
        const { name, newParentId, id } = folderData;

        try {
            const folder = await prisma.folder.update({
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
            return await prisma.file.findMany({
                orderBy:{
                    uploadedAt: 'desc'
                }
            })
        }catch (error:any){
            throw new Error(error.message);
        }
    }


    async allFolders(): Promise<any[]> {
        // Simulate fetching all folder from a database
       try{
            return await prisma.folder.findMany({
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
            return await prisma.folder.findUnique({
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
            return await prisma.file.findUnique({
                where: { id: fileId },
            });
        } catch (error:any) {
            throw new Error(error.message);
        }
    }

    async getFolderByPath(fullPath:string, nullValue: boolean): Promise<any> {

        if (nullValue) {
            return await prisma.folder.findFirst({
                where: {
                    fullPath: fullPath,
                    parentId: null,
                }
            })
        }
        return await prisma.folder.findFirst({
            where: {
                fullPath: fullPath,
            }
        })
    }

    async getFileByPath(remotePath: string) {
        return await prisma.file.findFirst({
            where: {
                filePath: remotePath
            }
        })
    }

    async updateDeletedFolder(folderData: { folderPath: string; userId: string; folderId: string }) {
        return await prisma.folder.update({
            where: {
                id: folderData.folderId,
            },
            data:{
                deleted: true,
            }
        })
    }
}


const fileRepo = new fileRepository();
export default fileRepo;