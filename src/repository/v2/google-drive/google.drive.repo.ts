import {googleDrive, refreshAccessToken} from "../../../lib/";
import streamifier from 'streamifier';
import { retryWithBackoff } from "../../../lib/retry";

type FileData = {
	name: string;
	mimetype: string;
	size: number;
	localSource: Buffer;
	encoding: string;
	folderId?: string;
	remotePath?: string;
}

type MoveFileData = {
	fileId: string;
	newFolderId?: string;
}

type CopyFileData = {
	fileId: string;
	name?: string;
	folderId?: string;
}

/**
 * Checks if the error is related to token expiration and attempts to refresh the token.
 * @param error - The error to check.
 * @returns A boolean indicating whether the token was refreshed successfully.
 * @throws Error with a descriptive message if token refresh fails.
 */
async function handleTokenExpirationError(error: any): Promise<boolean> {
	// Check if the error is related to token expiration
	if (error.message.includes('invalid_grant') || 
		error.message.includes('invalid_token') ||
		(error.response && error.response.data && 
		 (error.response.data.error === 'invalid_grant' || 
		  error.response.data.error === 'invalid_token'))) {

		console.log('Token expiration detected, attempting to refresh...');

		// Attempt to refresh the token
		const refreshed = await refreshAccessToken();

		if (!refreshed) {
			throw new Error(
				"Google Drive API token has expired and automatic refresh failed. " +
				"Please update the GOOGLE_REFRESH_TOKEN in your .env file with a new token."
			);
		}

		console.log('Token refreshed successfully');
		return true;
	}

	return false;
}

/**
 * Helper function to handle token refresh and retry for Google Drive operations.
 * @param operation - The operation function to execute.
 * @param errorHandler - Optional custom error handler.
 * @returns The result of the operation.
 * @throws Error if the operation fails and token refresh doesn't help.
 */
async function withTokenRefresh<T>(
	operation: () => Promise<T>,
	errorHandler?: (error: any) => Promise<void>
): Promise<T> {
	try {
		return await operation();
	} catch (error: any) {
		console.error("Error in Google Drive operation:", error);

		// Check if the error is related to token expiration and attempt to refresh
		try {
			const tokenRefreshed = await handleTokenExpirationError(error);

			// If token was refreshed, retry the operation
			if (tokenRefreshed) {
				console.log("Retrying operation after token refresh");
				return await operation();
			}
		} catch (refreshError: any) {
			console.error("Token refresh failed:", refreshError);
			throw refreshError;
		}

		// If there's a custom error handler, use it
		if (errorHandler) {
			await errorHandler(error);
		}

		throw new Error(error.message);
	}
}

class GoogleDriveRepo{

	async createFolder(folderData: any) {
		return withTokenRefresh(async () => {
			const folderMetadata = {
				name: folderData.folderName,
				mimeType: "application/vnd.google-apps.folder",
				parents: folderData.parentId ? [folderData.parentId] : undefined,
			};

			// Create folder with retry
			const folder = await retryWithBackoff(async () => {
				return await googleDrive.files.create({
					requestBody: folderMetadata,
					fields: "id, webViewLink, webContentLink, name, size",
				});
			});

			// Grant access to the folder with retry
			if (folder.data.id) {
				await retryWithBackoff(async () => {
					return await googleDrive.permissions.create({
						fileId: folder.data.id ? folder.data.id : "",
						requestBody: {
							role: "reader",
							type: "anyone",
						},
					});
				});
			}

			return folder;
		});
	}


	/**
	 * Uploads a file to Google Drive.
	 * @param data - The file data to be uploaded.
	 * @returns The response from the Google Drive API.
	 * @throws Error if there is an error during the upload process.
	 */

	async uploadFile(data: FileData) {
		return withTokenRefresh(async () => {
			// Upload file with retry
			const response = await retryWithBackoff(async () => {
				return await googleDrive.files.create({
					requestBody: {
						name: data.name,
						mimeType: data.mimetype,
						parents: data.folderId ? [data.folderId] : undefined,
					},
					media: {
						mimeType: data.mimetype,
						body: streamifier.createReadStream(data.localSource),
					},
					fields: "id, webViewLink, webContentLink, name, size",
				});
			});

			// Grant access to the file with retry
			if (response.data.id) {
				await retryWithBackoff(async () => {
					return await googleDrive.permissions.create({
						fileId: response.data.id ? response.data.id : "",
						requestBody: {
							role: "reader",
							type: "anyone",
						},
					});
				});
			}

			return response;
		});
	}


	async getFileById(fileId: string) {
		return withTokenRefresh(async () => {
			// Get file with retry
			const file = await retryWithBackoff(async () => {
				return await googleDrive.files.get({
					fileId: fileId,
					fields: "id, webViewLink, webContentLink, name, size",
				});
			});

			return file;
		});
	}

	/**
	 * Moves a file to a different folder in Google Drive.
	 * @param data - The data for the file to be moved.
	 * @returns The response from the Google Drive API.
	 * @throws Error if there is an error during the move process.
	 */
	async moveFile(data: MoveFileData) {
		return withTokenRefresh(async () => {
			// Get the current file to get its parents
			const file = await retryWithBackoff(async () => {
				return await googleDrive.files.get({
					fileId: data.fileId,
					fields: "parents",
				});
			});

			// Remove the file from its current parent and add to new parent
			const previousParents = file.data.parents ? file.data.parents.join(',') : '';

			// Move file with retry
			const response = await retryWithBackoff(async () => {
				return await googleDrive.files.update({
					fileId: data.fileId,
					addParents: data.newFolderId,
					removeParents: previousParents,
					fields: "id, webViewLink, webContentLink, name, size, parents",
				});
			});

			return response;
		});
	}

	/**
	 * Copies a file in Google Drive.
	 * @param data - The data for the file to be copied.
	 * @returns The response from the Google Drive API.
	 * @throws Error if there is an error during the copy process.
	 */
	async copyFile(data: CopyFileData) {
		return withTokenRefresh(async () => {
			// Copy file with retry
			const response = await retryWithBackoff(async () => {
				return await googleDrive.files.copy({
					fileId: data.fileId,
					requestBody: {
						name: data.name,
						parents: data.folderId ? [data.folderId] : undefined,
					},
					fields: "id, webViewLink, webContentLink, name, size",
				});
			});

			// Grant access to the copied file with retry
			if (response.data.id) {
				await retryWithBackoff(async () => {
					return await googleDrive.permissions.create({
						fileId: response.data.id ? response.data.id : "",
						requestBody: {
							role: "reader",
							type: "anyone",
						},
					});
				});
			}

			return response;
		});
	}

	/**
	 * Renames a file in Google Drive.
	 * @param data - The data for the file to be renamed.
	 * @returns The response from the Google Drive API.
	 * @throws Error if there is an error during the rename process.
	 */
	async renameFile(data: { fileId: string, newName: string }) {
		return withTokenRefresh(async () => {
			// Rename file with retry
			const response = await retryWithBackoff(async () => {
				return await googleDrive.files.update({
					fileId: data.fileId,
					requestBody: {
						name: data.newName,
					},
					fields: "id, webViewLink, webContentLink, name, size",
				});
			});

			return response;
		});
	}

	/**
	 * Renames a folder in Google Drive.
	 * @param data - The data for the folder to be renamed.
	 * @returns The response from the Google Drive API.
	 * @throws Error if there is an error during the rename process.
	 */
	async renameFolder(data: { folderId: string, newName: string }) {
		return withTokenRefresh(async () => {
			// Rename folder with retry
			const response = await retryWithBackoff(async () => {
				return await googleDrive.files.update({
					fileId: data.folderId, // In Google Drive, folders are also files
					requestBody: {
						name: data.newName,
					},
					fields: "id, webViewLink, webContentLink, name, size",
				});
			});

			return response;
		});
	}
}


const googleDriveRepo = new GoogleDriveRepo();
export default googleDriveRepo;
