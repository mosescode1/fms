import {Response, Request} from 'express';
import permissionService from '../../../service/v1/permission/permission.service';
import { Permissions, ResourceType } from '@prisma/client';

class PermissionController{

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

	createPermission = async (req:Request, res:Response)=>{
		try {
			const { 
				resourceType, 
				permissions, 
				folderId, 
				fileId, 
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

			// Validate that either folderId or fileId is provided based on resourceType
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

			// Validate that either accountId or groupId is provided
			if (!accountId && !groupId) {
				return res.status(400).json({
					status: 'error',
					message: "Either account ID or group ID is required"
				});
			}

			// Create permission data
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
			const { id } = req.params;

			if (!id) {
				return res.status(400).json({
					status: 'error',
					message: "Permission ID is required"
				});
			}

			const permission = await permissionService.getPermissionById(id);

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
			const { id } = req.params;

			if (!id) {
				return res.status(400).json({
					status: 'error',
					message: "Permission ID is required"
				});
			}

			await permissionService.removePermission(id);

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
}


const permissionController = new PermissionController()
export default permissionController;
