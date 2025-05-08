import trashService from '../../service/trash/trash.service';
import {Request, Response, NextFunction} from "express";

class TrashController{

	async getAllTrashedItems(req: Request, res: Response, next: NextFunction){
		const trashedItems = await trashService.getAllTrashedItems();
		res.status(200).json({
			status: "success",
			data: {
				trashedItems
			}
		});

	}


	async restoreTrashItem(req:Request, res: Response, next: NextFunction){
		const trashId = req.params.itemId;

		console.log(trashId)

	}
}


const trashController = new TrashController()
export default  trashController;