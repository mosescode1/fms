import permissionRepo from '../../repository/permission/permission.repo';
import {AppError} from '../../lib';
import fileRepo from '../../repository/files/file.repo';

type permissionDto = {
	type: string;
	folderPath: string;
	targetType: string;
	accountId: string;
	targetId?: string;
	folderId?: string;
}

class PermissionService{

	async getAllPermission() {
		try{
			return await permissionRepo.getAllPermission();
		}catch(error:any){
			throw new AppError({message: error.message, statusCode: 500});
		}
	}

	async createPermission(permissionData:permissionDto ) {
		try{
			// check folder path
			const folderPath = await fileRepo.getFolderByPath(permissionData.folderPath, false);
			console.log("folders path",folderPath)
			if (!folderPath) {
				throw new AppError({message: "Folder path does not exist", statusCode: 404});
			}
			// check if account already has permission on the folderPath and user id
			const existingPermission = await permissionRepo.getUserPermissionByPath(permissionData.accountId, permissionData.folderPath);
			if (existingPermission){
				throw new AppError({message:"Permission already Set", statusCode: 404});
			}
			permissionData.targetId = folderPath.id;
			permissionData.folderId = folderPath.id;

			// create permission
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
			const userPermissions = await permissionRepo.getUserPermission(userId);
			if (!userPermissions) {
				throw new AppError({message: "Permission not found", statusCode: 404});
			}
			return userPermissions;
		}catch (error:any){
			if (error instanceof AppError) {
				throw error;
			} else {
				throw new AppError({message: error.message, statusCode: 500});
			}
		}
	}
}


const permissionService = new PermissionService();
export default permissionService;