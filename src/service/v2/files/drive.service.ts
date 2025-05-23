import fileRepo from "../../../repository/v1/files/file.repo";
import {AppError} from "../../../lib"
import streamifier from 'streamifier';
import Readable from "stream"
import {FolderData} from '../../../types/trash.types';
import googleDriveRepo from '../../../repository/v2/google-drive/google.drive.repo';
import cacheService from '../../../lib/cache';

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

	private rootPath=  "";
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
			} else {
				folderData["remotePath"] = await this.getParentFolderPath(folderData.parentId, folderData.folderName);

				// Invalidate parent folder cache since its children will change
				cacheService.delete(`folder:${folderData.parentId}`);
			}

			// Check if the folder already exists
			if (await fileRepo.getFolderByPath(folderData.remotePath, false)) {
				throw new AppError({ message: "Folder already exists", statusCode: 409 });
			}

			// Create the folder on the server
			const resp = await googleDriveRepo.createFolder(folderData);

			// Save the folder in the repository
			folderData["id"] = resp.data.id;
			const newFolder = await fileRepo.createFolder(folderData);

			return newFolder;
		} catch (error: any) {
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}



	async uploadFile(fileData:any) {
		let remotePath;

		try {
			if (fileData.folderId) {
				remotePath = await this.getParentFolderPath(fileData.folderId, fileData.name);

				// Invalidate parent folder cache since its children will change
				cacheService.delete(`folder:${fileData.folderId}`);
			} else {
				remotePath = this.rootPath;
			}

			console.log(remotePath, "remotePath" );
			fileData.remotePath = remotePath;

			// Check if the file already exists
			if (await fileRepo.getFileByPath(fileData.remotePath)) {
				throw new AppError({ message: "File already exists", statusCode: 409 });
			}

			// check the file name already exists
			if (await fileRepo.getFileByName(fileData.name)) {
				throw new AppError({ message: "File name already exists", statusCode: 409 });
			}

			// Upload file to Google Drive
			const data = await googleDriveRepo.uploadFile(fileData);

			// Save file metadata
			fileData['id'] = data.data.id;
			fileData['webViewLink'] = data.data.webViewLink;
			fileData['webContentLink'] = data.data.webContentLink;

			// Save to database
			const newFile = await fileRepo.uploadFile(fileData);

			return newFile;
		} catch (error: any) {
			console.error("Error uploading file:", error);
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}

	async allFiles(skip?: number, limit?: number) {
		try {
			return await fileRepo.allFiles(skip, limit);
		} catch (error:any) {
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}

	async allFolders(skip?: number, limit?: number) {
		try {
			return await fileRepo.allFolders(skip, limit);
		} catch (error:any) {
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}

	async getFolderById(folderId: string) {
		try {
			// Use cache for folder data with a 5-minute TTL
			return await cacheService.getOrSet(
				`folder:${folderId}`,
				async () => await fileRepo.getFolderById(folderId),
				300 // 5 minutes
			);
		} catch (error:any) {
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}

	async getFileById(fileId: string) {
		try {
			// Use cache for file data with a 5-minute TTL
			return await cacheService.getOrSet(
				`file:${fileId}`,
				async () => await fileRepo.getFileById(fileId),
				300 // 5 minutes
			);
		} catch (error:any) {
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
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
		try {
			const result = await fileRepo.updateDeletedFolder(folderData);

			// Invalidate folder cache
			cacheService.delete(`folder:${folderData.folderId}`);

			return result;
		} catch (error: any) {
			console.error("Error deleting folder", error);
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}

	async accessFiles(userId: string, skip?: number, limit?: number) {
		try {
			return await fileRepo.accessFiles(userId, skip, limit);
		} catch (error: any) {
			console.error("Error fetching user files", error);
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}
}


const fileServiceInstance = new fileService();
export default fileServiceInstance;
