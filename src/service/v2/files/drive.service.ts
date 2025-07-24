import fileRepo from "../../../repository/v1/files/file.repo";
import {AppError} from "../../../lib"
import streamifier from 'streamifier';
import Readable from "stream"
import {FolderData} from '../../../types/trash.types';
import googleDriveRepo from '../../../repository/v2/google-drive/google.drive.repo';
import {redisService} from '../../../lib/cache';
import auditLogService from '../../../service/v1/auditLog/audit_log.service';
import {prisma} from '../../../prisma/prisma.client';

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
				await redisService.delete(`folder:${folderData.parentId}`);
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

			// Create audit log
			await auditLogService.createAuditLog({
				action: "CREATE",
				targetId: newFolder.id,
				actorId: folderData.userId,
				targetType: "FOLDER",
				folderId: newFolder.id
			});

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
				await redisService.delete(`folder:${fileData.folderId}`);
			} else {
				remotePath = this.rootPath;
			}

			fileData.remotePath = remotePath;

			// Check if the file already exists
			if (await fileRepo.getFileByPath(fileData.remotePath)) {
				throw new AppError({ message: "File already exists", statusCode: 409 });
			}

			// Upload file to Google Drive
			const data = await googleDriveRepo.uploadFile(fileData);

			// Save file metadata
			fileData['id'] = data.data.id;
			fileData['webViewLink'] = data.data.webViewLink;
			fileData['webContentLink'] = data.data.webContentLink;

			// Save to database
			const newFile = await fileRepo.uploadFile(fileData);

			// Create audit log
			await auditLogService.createAuditLog({
				action: "UPLOAD_FILE",
				targetId: newFile.id,
				actorId: fileData.userId,
				targetType: "FILE",
				fileId: newFile.id,
				folderId: fileData.folderId || null
			});

			return newFile;
		} catch (error: any) {
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
			const cachedData =  await redisService.get(`folder:${folderId}`);
			
			if (cachedData) {
				return JSON.parse(cachedData);
			}
			const folder = await fileRepo.getFolderById(folderId)
			await redisService.set(`folder:${folderId}`, folder);
			return folder;
		} catch (error:any) {
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}

	async getFileById(fileId: string) {
		try {
			// Use cache for file data with a 5-minute TTL
			const cachedData = await redisService.get(`file:${fileId}`);
			if (cachedData) {
				return JSON.parse(cachedData);
			}
			const file = await fileRepo.getFileById(fileId);
			await redisService.set(`file:${fileId}`, file);
			return file;
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
			throw new Error(error.message);
		}
	}

	async userDeleteFolder(folderData: FolderData) {
		try {
			const result = await fileRepo.updateDeletedFolder(folderData);

			// Invalidate folder cache
			await redisService.delete(`folder:${folderData.folderId}`);

			// Create audit log
			await auditLogService.createAuditLog({
				action: "DELETE",
				targetId: folderData.folderId ? folderData.folderId : "",
				actorId: folderData.accountId,
				targetType: "FOLDER",
				folderId: folderData.folderId
			});

			return result;
		} catch (error: any) {
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}

	async userDeleteFile(fileData: FolderData) {
		try {
			const result = await fileRepo.updateDeletedFile(fileData);

			// Invalidate file cache
			await redisService.delete(`file:${fileData.fileId}`);

			// Create audit log
			await auditLogService.createAuditLog({
				action: "DELETE",
				targetId: fileData.fileId ? fileData.fileId : "",
				actorId: fileData.accountId,
				targetType: "FILE",
				fileId: fileData.fileId
			});

			return result;
		} catch (error: any) {
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}

 async uploadFolder(data: { 
		files: Express.Multer.File[], 
		folderStructure: Record<string, { path: string, name: string }>, 
		parentId?: string, 
		userId: string 
	}) {
		try {
			const { files, folderStructure, parentId, userId } = data;

			// Validate input data
			if (!files || !Array.isArray(files)) {
				throw new AppError({ message: "Files must be an array", statusCode: 400 });
			}

			if (!folderStructure || typeof folderStructure !== 'object') {
				throw new AppError({ 
					message: "Folder structure must be an object mapping file paths to their metadata", 
					statusCode: 400 
				});
			}
			

			// Create a map to store created folders by path
			const folderMap = new Map<string, any>();
			const createdFiles = [];
			const uniqueFolderPaths = new Set<string>();

			// Extract all unique folder paths from the structure
			for (const originalPath in folderStructure) {
				const pathInfo = folderStructure[originalPath];
				if (pathInfo && pathInfo.path) {
					// Normalize the path to ensure consistent format
					const normalizedPath = pathInfo.path.startsWith('/') ? pathInfo.path : '/' + pathInfo.path;
					uniqueFolderPaths.add(normalizedPath);
				}
			}

			// Process all folder paths to create the folder hierarchy
			for (const fullPath of uniqueFolderPaths) {
				if (fullPath === '/' || fullPath === '') continue; // Skip root

				const pathParts = fullPath.split('/').filter(part => part !== '');
				let currentPath = '';
				let currentParentId = parentId

				// Create each folder in the path if it doesn't exist
				for (const part of pathParts) {
					currentPath += '/' + part;

					if (!folderMap.has(currentPath)) {
						// Check if folder already exists at this path
						let folder = await fileRepo.getFolderByPath(currentPath, true);

						if (!folder) {
							// Create the folder
							const folderData = {
								folderName: part,
								parentId: currentParentId,
								userId: userId,
							};

							try {
								folder = await this.createFolder(folderData);
							} catch (error: any) {
								// If folder creation fails but it's because it already exists, try to fetch it
								if (error.statusCode === 409) {
									folder = await fileRepo.getFolderByPath(currentPath, true);
									if (!folder) {
										throw error; // Re-throw if we still can't find it
									}
								} else {
									throw error; // Re-throw other errors
								}
							}
						}

						folderMap.set(currentPath, folder);
						currentParentId = folder.id;
					} else {
						currentParentId = folderMap.get(currentPath).id;
					}
				}
			}

			// Now upload all files to their respective folders
			for (const file of files) {
				// Find the matching entry in folderStructure by comparing file properties
				let matchingPath = null;
				let pathInfo = null;

				// First try to find by originalname directly (simple case)
				if (folderStructure[file.originalname]) {
					matchingPath = file.originalname;
					pathInfo = folderStructure[matchingPath];
				} else {
					// If not found, search through all entries to find a match
					for (const path in folderStructure) {
						const info = folderStructure[path];
						// Check if the filename matches the last part of the path
						const pathFileName = path.split('/').pop() || '';

						if (info.name === file.originalname || pathFileName === file.originalname) {
							matchingPath = path;
							pathInfo = info;
							break;
						}
					}
				}

				// If still no match found, use originalname as fallback
				if (!pathInfo) {
					console.warn(`No matching folder structure entry found for file: ${file.originalname}`);
				}

				// Extract the actual filename and folder path
				const fileName = pathInfo?.name || file.originalname.split('/').pop() || file.originalname;
				const folderPath = pathInfo?.path || '';
				const normalizedFolderPath = folderPath.startsWith('/') ? folderPath : '/' + folderPath;

				// Get the folder ID for this path
				let folderId = parentId;
				if (normalizedFolderPath && normalizedFolderPath !== '/' && folderMap.has(normalizedFolderPath)) {
					folderId = folderMap.get(normalizedFolderPath).id;
				}

				// Upload the file
				try {
					const fileData = {
						name: fileName,
						mimetype: file.mimetype,
						size: file.size,
						encoding: file.encoding,
						folderId: folderId,
						remotePath: normalizedFolderPath + '/' + fileName,
						localSource: file.buffer,
						userId: userId,
					};

					const uploadedFile = await this.uploadFile(fileData);
					createdFiles.push(uploadedFile);
				} catch (error: any) {
					// Continue with other files even if one fails
					if (error.statusCode !== 409) { // Ignore "already exists" errors
						throw error;
					}
				}
			}

			// Create an audit log for the overall folder upload operation
			if (folderMap.size > 0) {
				// Get the root folder of the upload
				const rootFolders = Array.from(folderMap.values())
					.filter(folder => folder.parentId === parentId);

				if (rootFolders.length > 0) {
					await auditLogService.createAuditLog({
						action: "UPLOAD_FOLDER",
						targetId: rootFolders[0].id,
						actorId: userId,
						targetType: "FOLDER",
						folderId: rootFolders[0].id
					});
				}
			}

			return {
				folders: Array.from(folderMap.values()),
				files: createdFiles
			};
		} catch (error: any) {
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}

	async accessFiles(userId: string, skip?: number, limit?: number) {
		try {
			console.log("Fetching user files with skip:", skip, "and limit:", limit);
			return await fileRepo.accessFiles(userId, skip, limit);
		} catch (error: any) {
			console.error("Error fetching user files", error);
			throw new AppError({ message: error.message, statusCode: error.statusCode || 500 });
		}
	}
}


const fileServiceInstance = new fileService();
export default fileServiceInstance;
