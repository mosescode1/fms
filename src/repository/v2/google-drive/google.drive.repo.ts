import {googleDrive} from "../../../lib/";
import streamifier from 'streamifier';

type FileData = {
	name: string;
	mimetype: string;
	size: number;
	localSource: Buffer;
	encoding: string;
	folderId?: string;
	remotePath?: string;
}

class GoogleDriveRepo{

	async createFolder(folderData: any) {
		try {
			const folderMetadata = {
				name: folderData.folderName,
				mimeType: "application/vnd.google-apps.folder",
				parents: [folderData.parentId],
			};

			const folder = await googleDrive.files.create({
				requestBody: folderMetadata ? folderMetadata : {},
				fields: "id, webViewLink, webContentLink, name, size",
			});

			// grant access to the folder
			await googleDrive.permissions.create({
				fileId: folder.data.id ? folder.data.id : "",
				requestBody: {
					role: "reader",
					type: "anyone",
				},
			});
			return folder;
		} catch (error:any) {
			console.error("Error creating folder", error);
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
		try{
			const response = await googleDrive.files.create(
				{
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
				}
			);

			// grant access to the file
			await googleDrive.permissions.create({
				fileId: response.data.id ? response.data.id : "",
				requestBody: {
					role: "reader",
					type: "anyone",
				},
			});
			return response;
		}catch(error:any){
			console.error("Error uploading file", error);
			throw new Error(error.message);
		}
	}


	async getFileById(fileId: string) {
		try {
			const file = await googleDrive.files.get({
				fileId: fileId,
				fields: "id, webViewLink, webContentLink, name, size",
			});
			return file;
		} catch (error:any) {
			console.error("Error getting file", error);
			throw new Error(error.message);
		}
	}
}


const googleDriveRepo = new GoogleDriveRepo();
export default googleDriveRepo;