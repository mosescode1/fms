import trashService from '../../../service/v1/trash/trash.service';
import {Request, Response, NextFunction} from "express";
// import auditLogService from '../../../service/v1/auditLog/audit_log.service';

class TrashController {

	async getAllTrashedItems(req: Request, res: Response, next: NextFunction) {
		const trashedItems = await trashService.getAllTrashedItems();
		res.status(200).json({
			status: "success",
			data: {
				trashedItems
			}
		});

	}


	async restoreTrashItem(req: Request, res: Response, next: NextFunction) {
		const trashId = req.params.itemId;
		const type = req.body.type;
		const folderId = req.body.folderId;
		if (!trashId || !type || !folderId) {
			return res.status(400).json({error: 'Trash ID and type or folder id are required'});
		}

		if (type !== "FILE" && type !== "FOLDER") {
			return res.status(400).json({error: 'Type must be either FILE or FOLDER'});
		}


		// check if the item is in the trash
		const itemInTrash = await trashService.getTrashById(trashId);
		if (!itemInTrash) {
			return res.status(404).json({error: 'Item not found in trash'});
		}

		const item = {
			type: type,
			id: folderId
		}
		const restoredItem = await trashService.restoreTrashItem(item);
		if (!restoredItem) {
			return res.status(404).json({error: 'Item not found'});
		}

		// delete the file or folder from trash
		await trashService.deleteTrashItem(trashId);


		if (type === "FOLDER") {
			// await auditLogService.createAuditLog({
			// 	action: "RESTORE",
			// 	targetId: itemInTrash.folderId ? itemInTrash.folderId : "",
			// 	targetType: "FOLDER",
			// 	folderId: item.id,
			// 	actorId: req.user.userId,
			// })
		} else if (type === "FILE") {
			// await auditLogService.createAuditLog({
			// 	action: "RESTORE",
			// 	targetId: trashId,
			// 	targetType: "FILE",
			// 	fileId: item.id,
			// 	actorId: req.user.userId,
			// })
		}

		res.status(200).json({
			status: "success",
			data: {
				restoredItem
			}
		});


	}

	async permanentlyDeleteItem(req: Request, res: Response, next: NextFunction) {
		const trashId = req.params.itemId;
		const type = req.body.type;
		const folderId = req.body.folderId;

		if (!trashId || !type || !folderId) {
			return res.status(400).json({error: 'Trash ID and type or folder id are required'});
					}

		// check if the item exists


		// TODO: delete the item on the server

		// check if the item is in the trash
		const itemInTrash = await trashService.getTrashById(trashId);
		if (!itemInTrash) {
			return res.status(404).json({error: 'Item not found in trash'});
		}

		const item ={
			type: type,
			id: folderId
		}

		await trashService.deleteTrashItem(trashId);



		if (type === "FOLDER") {
			// await auditLogService.createAuditLog({
			// 	action: "DELETE",
			// 	targetId: itemInTrash.folderId ? itemInTrash.folderId : "",
			// 	targetType: "FOLDER",
			// 	folderId: item.id,
			// 	actorId: req.user.userId,
			// })
		} else if (type === "FILE") {
			// await auditLogService.createAuditLog({
			// 	action: "DELETE",
			// 	targetId: trashId,
			// 	targetType: "FILE",
			// 	fileId: item.id,
			// 	actorId: req.user.userId,
			// })

			res.status(200).json({
				status: "success",
				message: "Item deleted successfully"
			});
		}

	}

}
const trashController = new TrashController()
export default  trashController;