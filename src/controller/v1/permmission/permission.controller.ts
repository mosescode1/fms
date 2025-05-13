import {Response, Request} from 'express';
import permissionService from '../../../service/v1/permission/permission.service';

class PermissionController{


	getAllPermission = async (req:Request, res:Response) =>{
		const permission = await permissionService.getAllPermission();

		res.status(200).json({
			data:{
				permission
			}
		});
	}

	createPermission = async (req:Request, res:Response)=>{
		console.log(req.body)
		// validate request body
		const {type, folderPath, targetType, accountId } = req.body;
		if (!type || !folderPath || !targetType || !accountId) {
			return res.status(400).json({
				message: "Missing required fields"
			});
		}

		// create permission
		const permissionData = {
			type,
			folderPath,
			targetType,
			accountId
		}
		const permission = await permissionService.createPermission(permissionData);

		res.status(200).json({
			data:{
				permission
			}
		});
	}

	removePermission = async (req:Request, res:Response)=>{

	}
}


const permissionController = new PermissionController()
export default permissionController;