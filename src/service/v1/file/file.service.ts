import fileRepo from "../../../repository/v1/files/file.repo";
import sftpClientService from '../../../repository/v1/files/sftpClientService';
import {AppError} from "../../../lib"
import streamifier from 'streamifier';
import Readable from "stream"
import {FolderData} from '../../../types/trash.types';

type FileData = {
    name: string;
    mimetype: string;
    size: number;
    localSource: Buffer;
    encoding: string;
    folderId?: string;
    remotePath?: string;
}




class fileService {

    private rootPath= process.env.VM_ROOT_PATH || process.env.SFTP_ROOT_PATH || "/";
    /**
     * Get the full path of the parent folder.
     * @param parentId - The ID of the parent folder.
     * @param folderName - The name of the folder to be created.
     * @returns The full path of the parent folder.
     * */

    private async getParentFolderPath(parentId: string, folderName: string): Promise<string> {
        const parentFolder = await fileRepo.getFolderById(parentId);
        if (!parentFolder) {
            throw new AppError({ message: "Parent folder not found", statusCode: 404 });
        }
        return `${parentFolder.fullPath}/${folderName}`;
    }

    /**
     * Creates a folder in the database and on the server.
     * @param folderData - The data for the folder to be created.
     * @returns The created folder object.
     * @throws AppError if the folder already exists or if there is an error during creation.
     */

   async createFolder(folderData: any) {
        try {

            if (!folderData.parentId) {
                folderData["remotePath"] = this.rootPath + `/${folderData.folderName}`;
            }else{
                folderData["remotePath"]= await this.getParentFolderPath(folderData.parentId, folderData.folderName)
            }

            // Check if the folder already exists
            if (await fileRepo.getFolderByPath(folderData.remotePath, false)) {
                throw new AppError({ message: "Folder already exists", statusCode: 409 });
            }

            // Create the folder on the server
            // TODO comeback to this after server is up fix up
            // await sftpClientService.createFolder(folderData.remotePath);

            // Save the folder in the repository
            return await fileRepo.createFolder(folderData);
        } catch (error: any) {
            throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
        }
    }



 async uploadFile(fileData:any) {
       let remotePath;

     try {

         if (fileData.folderId){
             remotePath = await this.getParentFolderPath(fileData.folderId, fileData.name)
         }else{
             remotePath = this.rootPath;
         }

         fileData.remotePath = remotePath;

         // Check if the file already exists
         if (await fileRepo.getFileByPath(fileData.remotePath)) {
             throw new AppError({ message: "File already exists", statusCode: 409 });
         }



         // steamifier buffer
         const stream = streamifier.createReadStream(fileData.localSource);

         // const stream = Readable.from(fileData.localSource, { highWaterMark: 64 * 1024 }); //


         // create file on the server
         // TODO come back to this when server is up fix up
         // await sftpClientService.uploadFile(stream, fileData.remotePath);

         return await fileRepo.uploadFile(fileData);
     } catch (error: any) {
         console.error(error)
         throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
     }
 }

    async allFiles() {
        try {
            return await fileRepo.allFiles();
        } catch (error:any) {
            throw new Error(error.message);
        }
    }

    async allFolders() {
        try {
            return await fileRepo.allFolders();
        } catch (error:any) {
            throw new Error(error.message);
        }
    }

    async getFolderById(folderId: string) {
        try {
            return await fileRepo.getFolderById(folderId);
        } catch (error:any) {
            throw new Error(error.message);
        }
    }

    async getRootFolderPermissionLevel(folderPath: string[]) {
        try {
            return await Promise.all(
                folderPath.map(path => fileRepo.getFolderByPath(path, true))
            );
        } catch (error: any) {
            console.error("Error fetching folders by path", error);
            throw new Error(error.message);
        }
    }

    async userDeleteFolder(folderData: FolderData) {
        try{
            return fileRepo.updateDeletedFolder(folderData);
        }catch (error: any){
            console.error("Error deleting folder", error);
            throw new Error(error.message);
        }
    }

    /**
     * Moves a file to a different folder.
     * @param fileData - The data for the file to be moved.
     * @returns The moved file object.
     * @throws AppError if the file is not found or if there is an error during the move.
     */
    async moveFile(fileData: any) {
        try {
            // Get the file to move
            const file = await fileRepo.getFileById(fileData.id);
            if (!file) {
                throw new AppError({ message: "File not found", statusCode: 404 });
            }

            // Get the target folder
            if (fileData.newFolderId) {
                const targetFolder = await fileRepo.getFolderById(fileData.newFolderId);
                if (!targetFolder) {
                    throw new AppError({ message: "Target folder not found", statusCode: 404 });
                }
            }

            // Move the file in the database
            const movedFile = await fileRepo.moveFile(fileData);

            // Move the file on the server
            // TODO: Uncomment when server is up
            // if (file.filePath && movedFile.filePath) {
            //     await sftpClientService.rename(file.filePath, movedFile.filePath);
            // }

            return movedFile;
        } catch (error: any) {
            throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
        }
    }

    /**
     * Moves a folder to a different parent folder.
     * @param folderData - The data for the folder to be moved.
     * @returns The moved folder object.
     * @throws AppError if the folder is not found or if there is an error during the move.
     */
    async moveFolder(folderData: any) {
        try {
            // Get the folder to move
            const folder = await fileRepo.getFolderById(folderData.id);
            if (!folder) {
                throw new AppError({ message: "Folder not found", statusCode: 404 });
            }

            // Get the target parent folder
            if (folderData.newParentId) {
                const targetFolder = await fileRepo.getFolderById(folderData.newParentId);
                if (!targetFolder) {
                    throw new AppError({ message: "Target parent folder not found", statusCode: 404 });
                }
            }

            // Move the folder in the database
            const movedFolder = await fileRepo.renameOrMoveFolder({
                id: folderData.id,
                name: folder.name,
                newParentId: folderData.newParentId
            });

            // Move the folder on the server
            // TODO: Uncomment when server is up
            // if (folder.fullPath && movedFolder.fullPath) {
            //     await sftpClientService.rename(folder.fullPath, movedFolder.fullPath);
            // }

            return movedFolder;
        } catch (error: any) {
            throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
        }
    }

    /**
     * Copies a file to a different folder.
     * @param fileData - The data for the file to be copied.
     * @returns The copied file object.
     * @throws AppError if the file is not found or if there is an error during the copy.
     */
    async copyFile(fileData: any) {
        try {
            // Get the file to copy
            const file = await fileRepo.getFileById(fileData.id);
            if (!file) {
                throw new AppError({ message: "File not found", statusCode: 404 });
            }

            // Get the target folder
            if (fileData.targetFolderId) {
                const targetFolder = await fileRepo.getFolderById(fileData.targetFolderId);
                if (!targetFolder) {
                    throw new AppError({ message: "Target folder not found", statusCode: 404 });
                }
            }

            // Generate a new ID for the copied file
            const newId = fileData.newId || `${file.id}_copy_${Date.now()}`;

            // Copy the file in the database
            const copiedFile = await fileRepo.copyFile({
                id: fileData.id,
                targetFolderId: fileData.targetFolderId,
                newId: newId,
                userId: fileData.userId
            });

            // Copy the file on the server
            // TODO: Uncomment when server is up
            // if (file.filePath && copiedFile.filePath) {
            //     await sftpClientService.copy(file.filePath, copiedFile.filePath);
            // }

            return copiedFile;
        } catch (error: any) {
            throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
        }
    }

    /**
     * Copies a folder to a different parent folder.
     * @param folderData - The data for the folder to be copied.
     * @returns The copied folder object.
     * @throws AppError if the folder is not found or if there is an error during the copy.
     */
    async copyFolder(folderData: any) {
        try {
            // Get the folder to copy
            const folder = await fileRepo.getFolderById(folderData.id);
            if (!folder) {
                throw new AppError({ message: "Folder not found", statusCode: 404 });
            }

            // Get the target parent folder
            if (folderData.targetParentId) {
                const targetFolder = await fileRepo.getFolderById(folderData.targetParentId);
                if (!targetFolder) {
                    throw new AppError({ message: "Target parent folder not found", statusCode: 404 });
                }
            }

            // Generate a new ID for the copied folder
            const newId = folderData.newId || `${folder.id}_copy_${Date.now()}`;

            // Copy the folder in the database
            const copiedFolder = await fileRepo.copyFolder({
                id: folderData.id,
                targetParentId: folderData.targetParentId,
                newId: newId,
                userId: folderData.userId,
                newName: folderData.newName
            });

            // Copy the folder on the server
            // TODO: Uncomment when server is up
            // if (folder.fullPath && copiedFolder.fullPath) {
            //     await sftpClientService.copy(folder.fullPath, copiedFolder.fullPath, true);
            // }

            return copiedFolder;
        } catch (error: any) {
            throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
        }
    }

    /**
     * Renames a file.
     * @param fileData - The data for the file to be renamed.
     * @returns The renamed file object.
     * @throws AppError if the file is not found or if there is an error during the rename.
     */
    async renameFile(fileData: any) {
        try {
            // Get the file to rename
            const file = await fileRepo.getFileById(fileData.id);
            if (!file) {
                throw new AppError({ message: "File not found", statusCode: 404 });
            }

            // Rename the file in the database
            const renamedFile = await fileRepo.renameFile({
                id: fileData.id,
                newFileName: fileData.newFileName
            });

            // Rename the file on the server
            // TODO: Uncomment when server is up
            // if (file.filePath && renamedFile.filePath) {
            //     await sftpClientService.rename(file.filePath, renamedFile.filePath);
            // }

            return renamedFile;
        } catch (error: any) {
            throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
        }
    }

    /**
     * Renames a folder.
     * @param folderData - The data for the folder to be renamed.
     * @returns The renamed folder object.
     * @throws AppError if the folder is not found or if there is an error during the rename.
     */
    async renameFolder(folderData: any) {
        try {
            // Get the folder to rename
            const folder = await fileRepo.getFolderById(folderData.id);
            if (!folder) {
                throw new AppError({ message: "Folder not found", statusCode: 404 });
            }

            // Rename the folder in the database
            const renamedFolder = await fileRepo.renameOrMoveFolder({
                id: folderData.id,
                name: folderData.newFolderName,
                newParentId: folder.parentId // Keep the same parent
            });

            // Rename the folder on the server
            // TODO: Uncomment when server is up
            // if (folder.fullPath && renamedFolder.fullPath) {
            //     await sftpClientService.rename(folder.fullPath, renamedFolder.fullPath);
            // }

            return renamedFolder;
        } catch (error: any) {
            throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
        }
    }
}


const fileServiceInstance = new fileService();
export default fileServiceInstance;
