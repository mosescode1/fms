import fileRepo from "../../repository/files/file.repo";
import sftpClientService from '../../repository/files/sftpClientService';
import {AppError} from "../../lib"
import streamifier from 'streamifier';
import Readable from "stream"
import {FolderData} from '../../types/trash.types';

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
            // TODO comeback to this after server is up
            await sftpClientService.createFolder(folderData.remotePath);

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
         // TODO come back to this when server is up
         await sftpClientService.uploadFile(stream, fileData.remotePath);

         return await fileRepo.uploadFile(fileData);
     } catch (error: any) {
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
}


const fileServiceInstance = new fileService();
export default fileServiceInstance;