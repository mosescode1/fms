import fileRepo from "../../repository/files/file.repo";

class fileService {

    async createFolder(folderData: object) {
        try {
            return await fileRepo.createFolder(folderData);
        } catch (error:any) {
            throw new Error(error.message);
        }
    }

    async uploadFile(fileData: object) {
        try {
            return await fileRepo.createFile(fileData);
        } catch (error:any) {
            throw new Error(error.message);
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
}


const fileServiceInstance = new fileService();
export default fileServiceInstance;