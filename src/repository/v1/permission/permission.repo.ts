import {prisma} from "../../../prisma/prisma.client"

class PermissionRepo{

	getAllPermission = async  () =>{
		try{
			return await prisma.permission.findMany({
				include:{
					account: true,
					Folder: true
				}
			})
		}catch(error: any){
			throw new Error(error.message);
		}
	}

	createPermission = async (permissionData:any)=>{
		try{
			return await prisma.permission.create({
				data:permissionData,
			})
		}catch(error:any){
			throw new Error(error.message);
		}
	}


	getPermissionById = async (permissionId: string) =>{
		try{
			return await prisma.permission.findFirst({
				where: {
					id: permissionId
				}
			})
		}catch (error:any){
			throw new Error(error.message);
		}
	}

	removePermission = async (permissionId : string) =>{
		try{
			return await prisma.permission.delete({
				where:{
					id: permissionId
				}
			})
		}catch(error:any){
			throw new Error(error.message)
		}
	}

	async getUserPermission(userId: string) {
		try{
			return await prisma.permission.findMany({
				where: {
					accountId: userId
				},
				include:{
					Folder: true,
					account: true
				}
			})
		}catch (error: any){
			throw new Error(error.message);
		}
	}

	async getUserPermissionByPath(userId:string, path : string){
		try{
			return await prisma.permission.findFirst({
				where:{
					accountId: userId,
					folderPath:path
				}
			})
		}catch (error:any){
			throw new Error(error.message);
		}
	}
}

const permissionRepo = new PermissionRepo()
export default permissionRepo;