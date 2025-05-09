import {prisma} from '../../prisma/prisma.client';
import {FolderData} from '../../types/trash.types';
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
					folderId: fileData.fileId,
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
}


const trashRepo = new TrashRepo()
export default trashRepo;