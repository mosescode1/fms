import trashRepo from '../../repository/trash/trash.repo';
import {FolderData} from '../../types/trash.types';



class TrashService{

	async createTrashFolder(folderData: FolderData) {
		try{
			return await trashRepo.createTrashFolder(folderData);
		}catch (error: any){
			console.error("Error creating trash folder", error);
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
}


const trashService = new TrashService();
export default trashService;