import permissionRepo from '../../../repository/v1/permission/permission.repo';
import {AppError} from '../../../lib';
import fileRepo from '../../../repository/v1/files/file.repo';
import { Permissions, ResourceType } from '@prisma/client';
import userRepo from '../../../repository/v1/user/user.repo';

type AclEntryDto = {
    resourceType: ResourceType;
    permissions: Permissions[];
    inherited?: boolean;
    folderId?: string;
    fileId?: string;
    accountId?: string;
    groupId?: string;
}

class PermissionService{

	async getAllPermission() {
		try{
			return await permissionRepo.getAllPermission();
		}catch(error:any){
			throw new AppError({message: error.message, statusCode: 500});
		}
	}

	async createPermission(permissionData: AclEntryDto) {
		try{
			// Validate input data
			if (!permissionData.resourceType) {
				throw new AppError({message: "Resource type is required", statusCode: 400});
			}

			if (!permissionData.permissions || permissionData.permissions.length === 0) {
				throw new AppError({message: "At least one permission is required", statusCode: 400});
			}

			// For folder permissions
			if (permissionData.resourceType === ResourceType.FOLDER && permissionData.folderId) {
				// Check if the folder exists
				const folder = await fileRepo.getFolderById(permissionData.folderId);
				if (!folder) {
					throw new AppError({message: "Folder does not exist", statusCode: 404});
				}

				// check if the folder already has permission
				// if (!permissionData.accountId) {
				// 	const existingPermission = await permissionRepo.getGroupPermissionByFolderId(
				// 		permissionData.groupId,
				// 		permissionData.folderId
				// 	);
				// 	if (existingPermission.length > 0) {
				// 		throw new AppError({message: "Permission already set for this group on this folder", statusCode: 400});
				// 	}
				// }

				// Check if the user already has permission on this folder
				// if (permissionData.accountId) {
				// 	const existingPermission = await permissionRepo.getUserPermissionByFolderId(
				// 		permissionData.accountId,
				// 		permissionData.folderId
				// 	);
				// 	if (existingPermission) {
				// 		throw new AppError({message: "Permission already set for this user on this folder", statusCode: 400});
				// 	}
				// }
			}

			// For file permissions
			if (permissionData.resourceType === ResourceType.FILE && permissionData.fileId) {
				// Check if file exists
				const file = await fileRepo.getFileById(permissionData.fileId);
				if (!file) {
					throw new AppError({message: "File does not exist", statusCode: 404});
				}

				// Check if the user already has permission on this file
				// if (permissionData.accountId) {
				// 	const existingPermission = await permissionRepo.getUserPermissionByFileId(
				// 		permissionData.accountId,
				// 		permissionData.fileId
				// 	);
				// 	if (existingPermission) {
				// 		throw new AppError({message: "Permission already set for this user on this file", statusCode: 400});
				// 	}
				// }
			}

			// Create permission
			return await permissionRepo.createPermission(permissionData);
		}catch (error:any){
			if (error instanceof AppError) {
				throw error;
			} else {
				throw new AppError({message: error.message, statusCode: 500});
			}
		}
	}

	async getUserPermission(userId: string) {
		try{
			// check if the user exists
			const user = await userRepo.findUserById(userId);
			if (!user) {
				throw new AppError({message: "User does not exist", statusCode: 404});
			}

			// check if the user is a super_admin
			if (user.role === "SUPER_ADMIN") {
				return "SUPER_ADMIN has all permissions";
			}

			return await permissionRepo.getUserPermission(userId);

		}catch (error:any){
			if (error instanceof AppError) {
				throw error;
			} else {
				throw new AppError({message: error.message, statusCode: 500});
			}
		}
	}

	async getPermissionById(permissionId: string) {
		try {
			const permission = await permissionRepo.getPermissionById(permissionId);
			if (!permission) {
				throw new AppError({message: "Permission not found", statusCode: 404});
			}
			return permission;
		} catch (error: any) {
			if (error instanceof AppError) {
				throw error;
			} else {
				throw new AppError({message: error.message, statusCode: 500});
			}
		}
	}

	async removePermission(permissionId: string) {
		try {
			const permission = await permissionRepo.getPermissionById(permissionId);
			if (!permission) {
				throw new AppError({message: "Permission not found", statusCode: 404});
			}

			return await permissionRepo.removePermission(permissionId);
		} catch (error: any) {
			if (error instanceof AppError) {
				throw error;
			} else {
				throw new AppError({message: error.message, statusCode: 500});
			}
		}
	}

	async getGroupPermissions(groupId: string) {
		try {
			const groupPermissions = await permissionRepo.getGroupPermissions(groupId);
			if (!groupPermissions || groupPermissions.length === 0) {
				throw new AppError({message: "No permissions found for this group", statusCode: 404});
			}
			return groupPermissions;
		} catch (error: any) {
			console.log(error.message);
			if (error instanceof AppError) {
				throw error;
			} else {
				throw new AppError({message: "Internal Server Error", statusCode: 500});
			}
		}
	}

	async getAllPermissionUsers(permissionId: string) {
		try{
			const permission = await permissionRepo.getPermissionById(permissionId);
			if (!permission) {
				throw new AppError({message: "Permission not found", statusCode: 404});
			}

			// return all users
			return await permissionRepo.getPermissionUsers(permissionId)
		}catch (error:any){
			console.log(error.message);

			if (error instanceof AppError) {
				throw error;
			} else {
				throw new AppError({message: "Internal Server Error", statusCode: 500});
			}
		}
	}

	async getUserPermissionByFolderId(accountId: any, folderId: any) {
		try {
			 return await permissionRepo.getUserPermissionByFolderId(accountId, folderId);
		}catch (error: any) {
			console.log(error.message);

			if (error instanceof AppError) {
				throw error;
			} else {

				throw new AppError({message: "Internal Server Error", statusCode: 500});
			}
		}
	}

	async updatePermission(id: any, permissionData: {
		permissions: (Permissions)[];
	}) {
		try {
			return await permissionRepo.updatePermission(id, permissionData);
		}catch (error: any) {
			console.log(error.message);
			if (error instanceof AppError) {
				throw error;
			} else {
				throw new AppError({message: "Internal Server Error", statusCode: 500});
			}
		}
	}

	async getUserPermissionByFileId(accountId: any, fileId: any) {
		try {
			return await permissionRepo.getUserPermissionByFileId(accountId, fileId);
		}catch (error: any) {
			console.log(error.message);
			if (error instanceof AppError) {
				throw error;
			} else {
				throw new AppError({message: "Internal Server Error", statusCode: 500});
			}
		}
	}
}


const permissionService = new PermissionService();
export default permissionService;
