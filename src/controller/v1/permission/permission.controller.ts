import {Response, Request} from 'express';
import permissionService from '../../../service/v1/permission/permission.service';
import { Permissions, ResourceType } from '@prisma/client';
import userService from '../../../service/v1/user/user.service';

class PermissionController{

	createMemberPermission = async (req: Request, res: Response) => {
		try {
			const {
				resourceType,
				permissions,
				folderId,
				fileId,
				accountId,
				inherited = false
			} = req.body;

			// Validate required fields
			if (!resourceType || !permissions || permissions.length === 0) {
				return res.status(400).json({
					status: 'error',
					message: "Resource type and permissions are required"
				});
			}

			if (!accountId) {
				return res.status(400).json({
					status: 'error',
					message: "Account ID is required for member permissions"
				});
			}

			if (resourceType === ResourceType.FOLDER && !folderId) {
				return res.status(400).json({
					status: 'error',
					message: "Folder ID is required for folder permissions"
				});
			}

			if (resourceType === ResourceType.FILE && !fileId) {
				return res.status(400).json({
					status: 'error',
					message: "File ID is required for file permissions"
				});
			}

			// Check if user exists
			const user = await userService.findUserById(accountId);
			if (!user) {
				return res.status(404).json({
					status: 'error',
					message: "User not found"
				});
			}

			// Build permission data
			const permissionData = {
				resourceType: resourceType as ResourceType,
				permissions: permissions as Permissions[],
				inherited,
				folderId: resourceType === ResourceType.FOLDER ? folderId : undefined,
				fileId: resourceType === ResourceType.FILE ? fileId : undefined,
				accountId
			};

			let existingPermission;
			if (resourceType === ResourceType.FOLDER) {
				existingPermission = await permissionService.getUserPermissionByFolderId(accountId, folderId);
			} else {
				existingPermission = await permissionService.getUserPermissionByFileId(accountId, fileId);
			}

			let permission;
			if (existingPermission) {
				permission = await permissionService.updatePermission(existingPermission.id, permissionData);
			} else {
				permission = await permissionService.createPermission(permissionData);
			}

			res.status(201).json({
				status: 'success',
				data: {
					permission
				}
			});
		} catch (error: any) {
			res.status(error.statusCode || 500).json({
				status: 'error',
				message: error.message
			});
		}
	};

	// TODO: Create a new permission for member on file Might use this for file permissions later
	// createMemberPermissionFile = async (req:Request, res:Response) => {
	// 	try {
	// 		const {
	// 			resourceType,
	// 			permissions,
	// 			fileId,
	// 			accountId,
	// 			inherited = false
	// 		} = req.body;
	//
	// 		// Validate required fields
	// 		if (!resourceType || !permissions || permissions.length === 0) {
	// 			return res.status(400).json({
	// 				status: 'error',
	// 				message: "Resource type and permissions are required"
	// 			});
	// 		}
	//
	// 		// Validate that fileId is provided for file permissions
	// 		if (resourceType === ResourceType.FILE && !fileId) {
	// 			return res.status(400).json({
	// 				status: 'error',
	// 				message: "File ID is required for file permissions"
	// 			});
	// 		}
	//
	// 		// Validate that accountId is provided
	// 		if (!accountId) {
	// 			return res.status(400).json({
	// 				status: 'error',
	// 				message: "Account ID is required for member permissions"
	// 			});
	// 		}
	//
	// 		// Create permission data object
	// 		const permissionData = {
	// 			resourceType: resourceType as ResourceType,
	// 			permissions: permissions as Permissions[],
	// 			inherited,
	// 			fileId,
	// 			accountId
	// 		};
	//
	// 		// check if the user exists
	// 		const user = await userService.findUserById(accountId);
	// 		if (!user) {
	// 			return res.status(404).json({
	// 				status: 'error',
	// 				message: "User not found"
	// 			});
	// 		}
	//
	// 		let permission ;
	// 		// check if the user already has permission on this file
	// 		const existingPermission = await permissionService.getUserPermissionByFileId(accountId, fileId);
	//
	// 		if (existingPermission) {
	// 			// If permission already exists, update it
	// 			permission = await permissionService.updatePermission(existingPermission.id, permissionData);
	//
	// 		}else{
	// 			permission = await permissionService.createPermission(permissionData);
	// 		}
	//
	// 		res.status(201).json({
	// 			status: 'success',
	// 			data: {
	// 				permission
	// 			}
	// 		});
	// 	} catch (error: any) {
	// 		res.status(error.statusCode || 500).json({
	// 			status: 'error',
	// 			message: error.message
	// 		});
	// 	}
	// }


	getAllPermission = async (req:Request, res:Response) =>{
		try {
			const permissions = await permissionService.getAllPermission();

			res.status(200).json({
				status: 'success',
				data: {
					permissions
				}
			});
		} catch (error: any) {
			res.status(error.statusCode || 500).json({
				status: 'error',
				message: error.message
			});
		}
	}

	createPermissionGroup = async (req:Request, res:Response)=>{
		try {
			const {
				resourceType,
				permissions,
				folderId,
				folderIds,
				fileId,
				fileIds,
				accountId,
				groupId,
				inherited = false 
			} = req.body;

			// Validate required fields
			if (!resourceType || !permissions || permissions.length === 0) {
				return res.status(400).json({
					status: 'error',
					message: "Resource type and permissions are required"
				});
			}

			// Validate that either folderId/folderIds or fileId is provided based on resourceType
			if (resourceType === ResourceType.FOLDER && !folderId && (!folderIds || !Array.isArray(folderIds) || folderIds.length === 0)) {
				return res.status(400).json({
					status: 'error',
					message: "Folder ID or array of Folder IDs is required for folder permissions"
				});
			}

			if (resourceType === ResourceType.FILE && !fileId && (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0)) {
				return res.status(400).json({
					status: 'error',
					message: "File ID or array of File IDs is required for file permissions"
				});
			}

			// Validate that either accountId or groupId is provided
			if (!accountId && !groupId) {
				return res.status(400).json({
					status: 'error',
					message: "Either account ID or group ID is required"
				});
			}

			// Handle array of folderIds
			if (resourceType === ResourceType.FOLDER && folderIds && Array.isArray(folderIds)) {
				const createdPermissions = [];

				// Create a permission for each folderId
				for (const id of folderIds) {
					const permissionData = {
						resourceType: resourceType as ResourceType,
						permissions: permissions as Permissions[],
						inherited,
						folderId: id,
						accountId,
						groupId
					};
					const permission = await permissionService.createPermission(permissionData);
					createdPermissions.push(permission);
				}

				return res.status(201).json({
					status: 'success',
					data: {
						permissions: createdPermissions
					}
				});
			}

			// Handle array of fileIds
			if (resourceType === ResourceType.FILE && fileIds && Array.isArray(fileIds)) {
				const createdPermissions = [];

				// Create a permission for each fileId
				for (const id of fileIds) {
					const permissionData = {
						resourceType: resourceType as ResourceType,
						permissions: permissions as Permissions[],
						inherited,
						fileId: id,
						accountId,
						groupId
					};

					const permission = await permissionService.createPermission(permissionData);
					createdPermissions.push(permission);
				}

				return res.status(201).json({
					status: 'success',
					data: {
						permissions: createdPermissions
					}
				});
			}

			// Handle single folderId or fileId (backward compatibility)
			const permissionData = {
				resourceType: resourceType as ResourceType,
				permissions: permissions as Permissions[],
				inherited,
				folderId,
				fileId,
				accountId,
				groupId
			};

			const permission = await permissionService.createPermission(permissionData);

			res.status(201).json({
				status: 'success',
				data: {
					permission
				}
			});
		} catch (error: any) {
			res.status(error.statusCode || 500).json({
				status: 'error',
				message: error.message
			});
		}
	}

	getPermissionById = async (req:Request, res:Response) => {
		try {

			const { permissionId } = req.params;

			if (!permissionId) {
				return res.status(400).json({
					status: 'error',
					message: "Permission ID is required"
				});
			}

			const permission = await permissionService.getPermissionById(permissionId);

			res.status(200).json({
				status: 'success',
				data: {
					permission
				}
			});
		} catch (error: any) {
			res.status(error.statusCode || 500).json({
				status: 'error',
				message: error.message
			});
		}
	}

	getUserPermissions = async (req:Request, res:Response) => {
		try {
			const { userId } = req.params;

			if (!userId) {
				return res.status(400).json({
					status: 'error',
					message: "User ID is required"
				});
			}

			const permissions = await permissionService.getUserPermission(userId);

			res.status(200).json({
				status: 'success',
				data: {
					permissions
				}
			});
		} catch (error: any) {
			res.status(error.statusCode || 500).json({
				status: 'error',
				message: error.message
			});
		}
	}

	getGroupPermissions = async (req:Request, res:Response) => {
		try {
			const { groupId } = req.params;

			if (!groupId) {
				return res.status(400).json({
					status: 'error',
					message: "Group ID is required"
				});
			}

			const permissions = await permissionService.getGroupPermissions(groupId);

			res.status(200).json({
				status: 'success',
				data: {
					permissions
				}
			});
		} catch (error: any) {
			res.status(error.statusCode || 500).json({
				status: 'error',
				message: error.message
			});
		}
	}

	removePermission = async (req:Request, res:Response)=>{
		try {
			const { permissionId } = req.params;

			if (!permissionId) {
				return res.status(400).json({
					status: 'error',
					message: "Permission ID is required"
				});
			}

			await permissionService.removePermission(permissionId);

			res.status(200).json({
				status: 'success',
				message: "Permission removed successfully"
			});
		} catch (error: any) {
			res.status(error.statusCode || 500).json({
				status: 'error',
				message: error.message
			});
		}
	}

	getPermissionUsers = async (req:Request, res:Response) => {
		try {
			const { permissionId } = req.params;
			if (!permissionId) {
				return res.status(400).json({
					status: 'error',
					message: "Permission ID is required"
				});
			}
			const users = await permissionService.getAllPermissionUsers(permissionId);

			res.status(200).json({
				status: 'success',
				data: {
					users
				}
			});
		} catch (error: any) {
			res.status(error.statusCode || 500).json({
				status: 'error',
				message: error.message
			});
		}
	}
}


const permissionController = new PermissionController()
export default permissionController;
