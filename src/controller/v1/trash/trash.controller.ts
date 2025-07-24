import trashService from '../../../service/v1/trash/trash.service';
import {Request, Response, NextFunction} from "express";
import auditLogService from '../../../service/v1/auditLog/audit_log.service';

class TrashController {

 async getAllTrashedItems(req: Request, res: Response, next: NextFunction) {
		// Get all trashed items
		const allTrashedItems = await trashService.getAllTrashedItems();

		// If user is SUPER_ADMIN or ADMIN, return all items
		// Otherwise, filter to only show the user's own items
		let trashedItems = allTrashedItems;
		if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
			trashedItems = allTrashedItems.filter(group => {
				// Check if any item in the group belongs to the current user
				return group.items.some((item: any) => item.accountId === req.user.userId);
			});
		}

		res.status(200).json({
			status: "success",
			data: {
				trashedItems
			}
		});
	}


	async restoreTrashItem(req: Request, res: Response, next: NextFunction) {
		
	    if (!req.body){
			return res.status(400).json({error: 'Request body is required'});
	    }
	 
		console.log(req.body, req.params);
		
	    const trashId = req.params?.resourceId; // Fixed parameter name to match route
		const type = req.body?.type;
		const itemId = req.body?.itemId;
		if (!trashId){
			return res.status(400).json({error: 'Trash ID is required'});
		}

		if (!type) {
			return res.status(400).json({error: 'Type is required'});
		}

		if (!itemId) {
			return res.status(400).json({error: 'Item ID is required'});
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
			id: itemId
		}
		const restoredItem = await trashService.restoreTrashItem(item);
		if (!restoredItem) {
			return res.status(404).json({error: 'Item not found'});
		}

		// delete the file or folder from trash
		await trashService.deleteTrashItem(trashId);

		if (type === "FOLDER") {
			await auditLogService.createAuditLog({
				action: "RESTORE",
				targetId: itemInTrash.folderId ? itemInTrash.folderId : "",
				targetType: "FOLDER",
				folderId: item.id,
				actorId: req.user.userId,
			})
		} else if (type === "FILE") {
			await auditLogService.createAuditLog({
				action: "RESTORE",
				targetId: trashId,
				targetType: "FILE",
				fileId: item.id,
				actorId: req.user.userId,
			})
		}

		res.status(200).json({
			status: "success",
			data: {
				restoredItem
			}
		});
	}

	async permanentlyDeleteItem(req: Request, res: Response, next: NextFunction) {
		const trashId = req.params.trashId; // Fixed parameter name to match route
		const type = req.body.type;
		const folderId = req.body.folderId;

		if (!trashId || !type || !folderId) {
			return res.status(400).json({error: 'Trash ID and type or folder id are required'});
		}

		// check if the item is in the trash
		const itemInTrash = await trashService.getTrashById(trashId);
		if (!itemInTrash) {
			return res.status(404).json({error: 'Item not found in trash'});
		}

		// Check if user has permission to delete this item
		// Allow if user is admin or if they own the item
		if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN' && itemInTrash.accountId !== req.user.userId) {
			return res.status(403).json({
				status: "error",
				message: "You do not have permission to delete this item"
			});
		}

		const item = {
			type: type,
			id: folderId
		}

		// TODO: delete the item on the server if needed

		// Delete from trash table
		await trashService.deleteTrashItem(trashId);

		// Create audit log
		if (type === "FOLDER") {
			await auditLogService.createAuditLog({
				action: "DELETE",
				targetId: itemInTrash.folderId ? itemInTrash.folderId : "",
				targetType: "FOLDER",
				folderId: item.id,
				actorId: req.user.userId,
			});
		} else if (type === "FILE") {
			await auditLogService.createAuditLog({
				action: "DELETE",
				targetId: trashId,
				targetType: "FILE",
				fileId: item.id,
				actorId: req.user.userId,
			});
		}

		// Send response (fixed indentation to ensure response is sent for both file and folder types)
		res.status(200).json({
			status: "success",
			message: "Item deleted successfully"
		});
	}

	async getTrashAnalysis(req: Request, res: Response, next: NextFunction) {
		try {
			const analysis = await trashService.getTrashAnalysis();
			res.status(200).json({
				status: "success",
				data: analysis
			});
		} catch (error) {
			next(error); // Pass error to the global error handler
		}

	}

	async deletedFiles(req: Request, res: Response, next: NextFunction) {
	 		try {
			const deletedFiles = await trashService.deletedFiles();
			res.status(200).json({
				status: "success",
				data: deletedFiles
			});
		} catch (error) {
			next(error); // Pass error to the global error handler
		}
	}
}
const trashController = new TrashController()
export default  trashController;
