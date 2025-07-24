import {prisma} from '../../../prisma/prisma.client';
import {FolderData} from '../../../types/trash.types';
import _ from 'lodash';

class TrashRepo{


	async createTrashFolder(folderData: FolderData) {
		try{
			return await prisma.trash.create({
				data: {
					originalPath: folderData.originalPath,
					accountId: folderData.accountId,
					folderId: folderData.folderId,
					itemType: "FOLDER"
				}
			});
		}catch (error:any){
			throw new Error(error.message);
		}
	}

	async createFileTrash(fileData: FolderData) {
		try{
			return await prisma.trash.create({
				data: {
					originalPath: fileData.filePath,
					accountId: fileData.accountId,
					fileId: fileData.fileId,
					itemType: "FILE"
				}
			});
		}catch (error:any){
			throw new Error(error.message);
		}
	}

	async getAllTrashedItems() {
		try {
			const items = await prisma.trash.findMany({
				include: {
					deletedBy: true,  // fetch full user object
					folder: true,
					file: true
				}
			});

			// Group by user ID
			const grouped = _.groupBy(items, (item: { accountId: any; }) => item.accountId);


			// Transform into array of { user, items }
			return Object.values(grouped).map((group: any) => ({
				user: group[0].deletedBy.fullName, // since all items in group share the same user
				items: group
			}));
		}catch(error: any){
			throw new Error(error.message)
		}
	}

	async restoreTrashItem(item: {type: string, id: string}){
		if (item.type === "FOLDER"){
			return await prisma.folder.update({
				where:{
					id: item.id
				},
				data:{
					deleted: false
				}
			})
		}
		return await prisma.file.update({
			where:{
				id: item.id
			},
			data:{
				deleted: false
			}
		})

	}

	async getTrashById(trashId: string) {
		try {
			return await prisma.trash.findUnique({
				where: { id: trashId },
				include: {
					deletedBy: true,
					folder: true,
					file: true
				}
			});
		} catch (error:any) {
			throw new Error(error.message);
		}
	}

	async deleteTrashItem(trashId: string) {
		try{
			return await prisma.trash.delete({
				where: { id: trashId }
			});
		}catch (error:any) {
			throw new Error(error.message);
		}
	}

	async getTrashAnalysis() {
		try{
			const totalItems = await prisma.trash.count();
			const totalFolders = await prisma.trash.findMany({
				where: { itemType: "FOLDER" }
			});
			const totalFiles = await prisma.trash.count({
				where: { itemType: "FILE" }
			});

			//map through the folder to get the file inside and count the size
			const totalFoldersWithFiles = totalFolders.map((folder) => {
				return  prisma.folder.findUnique({
					where: { id: folder.folderId as string },
					include: { files: true }
				}).then(folderData => {
					return {
						totalSize: folderData?.files.reduce((acc, file) => acc + file.fileSize, 0)
					};
				})
			});

			const totalFilesSize = await Promise.all(totalFoldersWithFiles);
			const totalSize = totalFilesSize.reduce((acc, folder) => acc + (folder.totalSize || 0), 0);

			// add the total size of files in the trash
			const totalFilesInTrash = await prisma.file.findMany({
				where: { deleted: true },
				select: { fileSize: true }
			});

			const totalFilesSizeInTrash = totalFilesInTrash.reduce((acc, file) => acc + file.fileSize, 0);
			const totalSizeInTrash = totalSize + totalFilesSizeInTrash;


			return {
				totalItems,
				freedSpace: totalSizeInTrash,
			};

		}catch (error:any) {
			throw new Error(error.message);
		}
	}


	async deletedFiles(){
		try {
			return await prisma.trash.findMany({
				include:{
					deletedBy: true,
				}
			});
		} catch (error:any) {
			throw new Error(error.message);
		}
	}
}


const trashRepo = new TrashRepo()
export default trashRepo;