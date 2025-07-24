import trashRepo from '../../../repository/v1/trash/trash.repo';
import {FolderData} from '../../../types/trash.types';



class TrashService{

	async createTrashFolder(folderData: FolderData) {
		try{
			return await trashRepo.createTrashFolder(folderData);
		}catch (error: any){
			console.error("Error creating trash folder", error);
			throw new Error(error.message);
		}
	}

	async createTrashFile(fileData: FolderData) {
		try{
			return await trashRepo.createFileTrash(fileData);
		}catch (error: any){
			console.error("Error creating trash file", error);
			throw new Error(error.message);
		}
	}

	async getAllTrashedItems() {
		try{
			return await trashRepo.getAllTrashedItems()
		}catch (error: any){
			console.error("Error getting all trashed items")
			throw new Error(error.message)
		}
	}

	async restoreTrashItem(item: {type: string, id: string}){
		try{
			return await trashRepo.restoreTrashItem(item)
		}catch (error: any){
			console.error("Error restoring Item")
			throw new Error(error.message)
		}
	}

	async getTrashById(trashId: string) {
		try{
			return await trashRepo.getTrashById(trashId);
		}catch (error: any){
			console.error("Error getting trashed item by ID", error);
			throw new Error(error.message);
		}
	}

	async deleteTrashItem(trashId: string) {
		try{
			return await trashRepo.deleteTrashItem(trashId);
		}catch (error:any) {
			console.error("Error deleting trashed item by ID", error);
			throw new Error(error.message);
		}
	}
}


const trashService = new TrashService();
export default trashService;
