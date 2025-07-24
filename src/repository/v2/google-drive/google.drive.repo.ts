import {googleDrive} from "../../../lib/";
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

/**
 * Checks if the error is related to token expiration and throws a more descriptive error if it is.
 * @param error - The error to check.
 * @throws Error with a more descriptive message if the error is related to token expiration.
 */
function handleTokenExpirationError(error: any): void {
	if (error.message.includes('invalid_grant') || 
		(error.response && error.response.data && 
		 error.response.data.error === 'invalid_grant')) {
		throw new Error(
			"Google Drive API token has expired or been revoked. " +
			"Please update the GOOGLE_REFRESH_TOKEN in your .env file with a new token."
		);
	}
}

class GoogleDriveRepo{

	async createFolder(folderData: any) {
		try {
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
		} catch (error:any) {
			console.error("Error creating folder", error);

			// Check if the error is related to token expiration
			handleTokenExpirationError(error);

			throw new Error(error.message);
		}
	}


	/**
	 * Uploads a file to Google Drive.
	 * @param data - The file data to be uploaded.
	 * @returns The response from the Google Drive API.
	 * @throws Error if there is an error during the upload process.
	 */

	async uploadFile(data: FileData) {
		try {
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
		} catch (error:any) {
			console.error("Error uploading file", error);

			// Check if the error is related to token expiration
			handleTokenExpirationError(error);

			throw new Error(error.message);
		}
	}


	async getFileById(fileId: string) {
		try {
			// Get file with retry
			const file = await retryWithBackoff(async () => {
				return await googleDrive.files.get({
					fileId: fileId,
					fields: "id, webViewLink, webContentLink, name, size",
				});
			});

			return file;
		} catch (error:any) {
			console.error("Error getting file", error);

			// Check if the error is related to token expiration
			handleTokenExpirationError(error);

			throw new Error(error.message);
		}
	}
}


const googleDriveRepo = new GoogleDriveRepo();
export default googleDriveRepo;
