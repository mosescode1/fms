import {prisma} from "../../../prisma/prisma.client";
// import audit_logService from "../../../service/v1/auditLog/audit_log.service";
import {FolderData} from '../../../types/trash.types';

class fileRepository {
    rootPath =  "";

    private async buildFullPath(folderId: string): Promise<string> {
        const segments: string[] = [];

        let current = await prisma.folder.findUnique({
            where: { id: folderId },
            select: { name: true, parentId: true },
        });

        while (current) {
            segments.unshift(current.name); // Add a current folder to the front
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

        // 2. Update all the files directly in this folder
        await prisma.file.updateMany({
            where: { folderId },
            data: {
                filePath: fullPath,
            },
        });

        // 3. Get and recursively update all child folders
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
                    id: fileData.id,
                    fileName: fileData.name,
                    fileType: fileData.mimetype,
                    fileSize: fileData.size,
                    filePath: "", // temporary file path
                    encoding: fileData.encoding,
                    accountId: account ? account.id.toString() : null,
                    folderId: fileData.folderId,
                    webContentLink: fileData.webContentLink,
                    webViewLink: fileData.webViewLink,
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

            // TODO: add the file to the audit log
            const auditLogData = {
                action: "CREATE",
                actorId: file.accountId,
                targetId : file.id,
                targetType: "FILE",
                fileId: file.id,
            }
            // await audit_logService.createAuditLog(auditLogData)
            return updatedFile;

        }catch (error:any){
            throw new Error(error.message);
        }

    }


    async createFolder(folderData: any): Promise<any> {
        const { folderName, parentId, userId, id } = folderData;

        try {
            // find user or member with that id
            const user = await prisma.account.findFirst({
                where:{
                    id: userId,
                }
            })


            const folder = await prisma.folder.create({
                data: {
                    id: id,
                    name: folderName,
                    parentId: parentId ?? null,
                    accountId: user ? user.id : null,
                    fullPath: '', // temporary
                },
            });

            // Update fullPath
            const fullPath = this.rootPath +  await this.buildFullPath(folder.id);
            // create the folder in the database
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
            // await audit_logService.createAuditLog(auditLogData)
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

            // Update the path for folder and descendants
            await this.updateFullPathRecursively(folder.id);
            return folder
        } catch (err) {
            throw new Error("failed to rename or move folder")
        }
    }

    async allFiles(skip?: number, limit?: number): Promise<{ files: any[], total: number }> {
        try {
            const [files, total] = await Promise.all([
                prisma.file.findMany({
                    where: {
                        deleted: false,
                        folderId: null
                    },
                    orderBy: {
                        uploadedAt: 'desc'
                    },
                    skip: skip,
                    take: limit
                }),
                prisma.file.count({
                    where: {
                        deleted: false
                    }
                })
            ]);

            return { files, total };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }


    async allFolders(skip?: number, limit?: number): Promise<{ folders: any[], total: number }> {
        try {
            const [folders, total] = await Promise.all([
                prisma.folder.findMany({
                    where: {
                        parentId: null,
                        deleted: false
                    },
                    skip: skip,
                    take: limit
                }),
                prisma.folder.count({
                    where: {
                        parentId: null,
                        deleted: false
                    }
                })
            ]);

            return { folders, total };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getFolderById(folderId: string): Promise<any> {
        try {
            return  await prisma.folder.findUnique({
                where: { id: folderId , deleted: false},
                include: {
                    files: {where:{deleted: false}},
                    children: { where: {deleted:false}}
                },
            });
        } catch (error:any) {
            throw new Error(error.message);
        }
    }


    async getFileById(fileId: string): Promise<any> {
        try {
            return  prisma.file.findUnique({
                where: { id: fileId, deleted:false },
            });
        } catch (error:any) {
            throw new Error(error.message);
        }
    }

    async getFolderByPath(fullPath:string, nullValue: boolean): Promise<any> {

        if (nullValue) {
            return  prisma.folder.findFirst({
                where: {
                    fullPath: fullPath,
                    parentId: null,
                    deleted:false,
                }
            })
        }
        return  prisma.folder.findFirst({
            where: {
                fullPath: fullPath,
            }
        })
    }

     async getFileByPath(remotePath: string) {
        return  prisma.file.findFirst({
            where: {
                filePath: remotePath,
                deleted: false
            }
        })
    }

    async updateDeletedFolder(folderData: FolderData) {
        return  prisma.folder.update({
            where: {
                id: folderData.folderId,
            },
            data:{
                deleted: true,
            }
        })
    }

    async updateDeletedFile(fileData: FolderData) {
        return prisma.file.update({
            where: {
                id: fileData.fileId,
            },
            data: {
                deleted: true,
            }
        })
    }


    async accessFiles(userId: string, skip?: number, limit?: number): Promise<{ items: any[], total: number }> {
        try {
            console.log("Fetching files and folders for user:", userId);

            // Step 1: Get all group IDs the user is a member of
            const userGroups = await prisma.groupMember.findMany({
                where: { accountId: userId },
                select: { groupId: true },
            });
            const groupIds = userGroups.map(g => g.groupId);

            // Step 2: Common access conditions
            const fileConditions = {
                deleted: false,
                OR: [
                    { accountId: userId },
                    {
                        acls: {
                            some: {
                                OR: [
                                    { accountId: userId },
                                    { groupId: { in: groupIds } },
                                ],
                            },
                        },
                    },
                ],
            };

            const folderConditions = {
                deleted: false,
                OR: [
                    { accountId: userId },
                    {
                        AclEntry: {
                            some: {
                                OR: [
                                    { accountId: userId },
                                    { groupId: { in: groupIds } },
                                ],
                            },
                        },
                    },
                ],
            };

            // Step 3: Count total before pagination
            const [fileCount, folderCount] = await Promise.all([
                prisma.file.count({ where: fileConditions }),
                prisma.folder.count({ where: folderConditions })
            ]);

            const total = fileCount + folderCount;

            let files: any[] = [];
            let folders: any[] = [];

            if (skip !== undefined && limit !== undefined) {
                // Step 4a: Paginated fetch
                let fileSkip = 0;
                let fileLimit = 0;
                let folderSkip = 0;
                let folderLimit = 0;

                if (skip < fileCount) {
                    fileSkip = skip;
                    fileLimit = Math.min(limit, fileCount - fileSkip);
                    folderSkip = 0;
                    folderLimit = limit - fileLimit;
                } else {
                    fileSkip = 0;
                    fileLimit = 0;
                    folderSkip = skip - fileCount;
                    folderLimit = limit;
                }

                const [fetchedFiles, fetchedFolders] = await Promise.all([
                    fileLimit > 0 ? prisma.file.findMany({
                        where: fileConditions,
                        include: { acls: true },
                        skip: fileSkip,
                        take: fileLimit,
                        orderBy: { uploadedAt: 'desc' }
                    }) : [],
                    folderLimit > 0 ? prisma.folder.findMany({
                        where: folderConditions,
                        include: { AclEntry: true },
                        skip: folderSkip,
                        take: folderLimit,
                        orderBy: { createdAt: 'desc' }
                    }) : []
                ]);

                files = fetchedFiles;
                folders = fetchedFolders;

            } else {
                // Step 4b: Non-paginated fetch
                const [fetchedFiles, fetchedFolders] = await Promise.all([
                    prisma.file.findMany({
                        where: fileConditions,
                        include: { acls: true },
                        orderBy: { uploadedAt: 'desc' }
                    }),
                    prisma.folder.findMany({
                        where: folderConditions,
                        include: { AclEntry: true },
                        orderBy: { createdAt: 'desc' }
                    })
                ]);

                files = fetchedFiles;
                folders = fetchedFolders;
            }

            // Step 5: Filter out children of already-accessible folders
            let combinedItems = [...folders, ...files];
            const accessibleFolderIds = new Set(folders.map(f => f.id));

            combinedItems = combinedItems.filter(item => {
                const parentId = item.parentId || null;
                return !parentId || !accessibleFolderIds.has(parentId);
            });

            return {
                items: combinedItems,
                total
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getFileByName(name: string) {
        return prisma.file.findFirst({
            where: {
                fileName: name
            }
        });
    }
}


const fileRepo = new fileRepository();
export default fileRepo;
