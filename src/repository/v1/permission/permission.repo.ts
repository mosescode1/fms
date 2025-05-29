import {prisma} from "../../../prisma/prisma.client"
import { Permissions, ResourceType } from "@prisma/client";

class PermissionRepo{

	getAllPermission = async  () =>{
		try{
			return await prisma.aclEntry.findMany({
				include:{
					account: true,
					Folder: true,
					file: true,
					securityGroup: true
				}
			})
		}catch(error: any){
			throw new Error(error.message);
		}
	}

	createPermission = async (permissionData: {
		resourceType: ResourceType;
		permissions: Permissions[];
		inherited?: boolean;
		folderId?: string;
		fileId?: string;
		accountId?: string;
		groupId?: string;
	}) => {
		try{
			return await prisma.aclEntry.create({
				data: permissionData,
				include: {
					account: true,
					Folder: true,
					file: true,
					securityGroup: true
				}
			})
		}catch(error:any){
			throw new Error(error.message);
		}
	}

	getPermissionById = async (permissionId: string) =>{
		try{
			return await prisma.aclEntry.findFirst({
				where: {
					id: permissionId
				},
				include: {
					account: true,
					Folder: true,
					file: true,
					securityGroup: true
				}
			})
		}catch (error:any){
			throw new Error(error.message);
		}
	}

	removePermission = async (permissionId : string) =>{
		try{
			return await prisma.aclEntry.delete({
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
			return await prisma.aclEntry.findMany({
				where: {
					accountId: userId
				},
				include:{
					Folder: true,
					account: true,
					file: true
				}
			})
		}catch (error: any){
			throw new Error(error.message);
		}
	}

	async getUserPermissionByFolderId(userId: string, folderId: string) {
		try{
			return await prisma.aclEntry.findFirst({
				where:{
					accountId: userId,
					folderId: folderId
				}
			})
		}catch (error:any){
			throw new Error(error.message);
		}
	}

	async getUserPermissionByFileId(userId: string, fileId: string) {
		try{
			return await prisma.aclEntry.findFirst({
				where:{
					accountId: userId,
					fileId: fileId
				}
			})
		}catch (error:any){
			throw new Error(error.message);
		}
	}

	async getGroupPermissions(groupId: string) {
		try{
			return await prisma.aclEntry.findMany({
				where: {
					groupId: groupId
				},
				include:{
					Folder: true,
					file: true,
					securityGroup: true
				}
			})
		}catch (error: any){
			throw new Error(error.message);
		}
	}


	async getGroupPermissionByFolderId(groupId: string | undefined, folderId: string) {
		try{
			return await prisma.aclEntry.findMany({
				where:{
					groupId: groupId,
					folderId: folderId
				}
			})
		}catch (error:any){
			throw new Error(error.message);
		}
	}

	async getPermissionUsers(permissionId: string ) {
		try{
			return await prisma.aclEntry.findMany({
				where:{
					id: permissionId
				},
				include:{
					account: true
				}
			})
		}catch (error:any){
			throw new Error(error.message);
		}
	}
}

const permissionRepo = new PermissionRepo()
export default permissionRepo;
