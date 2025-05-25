import { prisma } from '../../../prisma/prisma.client';
import  {SecurityGroup} from "@prisma/client";

class SecurityGroupRepo {
	// get all security groups
	async allSecurityGroups() {
		try {
			return await prisma.securityGroup.findMany({
				include: {
					members: true,
					acls: true,
				},
			});
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async getSecurityGroupByName(name: string){
		try {
			return await prisma.securityGroup.findFirst({
				where: {
					name,
				},
			});
		}catch(error: any){
			throw new Error(error.message);
		}
	}

	// create a security group
	async createSecurityGroup(data: SecurityGroup & { acls: any[] } ) {
		try {
			return await prisma.securityGroup.create({
				data: {
					name: data.name,
					description: data.description,
				},
			});
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	// add users to the security group
	async addUsersTosecurityGroups(data: any) {
		try {
			return await prisma.groupMember.create({
				data: {
					accountId: data.userId,
					groupId: data.securityGroupId,
				},
			});
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	// edit a security group
	async editSecurityGroup(id: string, data: any) {
		try {
			return await prisma.securityGroup.update({
				where: {
					id,
				},
				data: {
					name: data.name,
					description: data.description
				},
			});
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	// delete security Group
	async deleteSecurityGroup(id: string) {
		try {
			return await prisma.securityGroup.delete({
				where: {
					id,
				},
			});
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async getSecurityGroupById(securityGroupId: any) {
		try{
			return await prisma.securityGroup.findUnique({
				where: {
					id: securityGroupId,
				},
			});
		}catch (error: any){
			throw new Error(error.message);
		}
	}

	async getUserInGroup(userId: any, securityGroupId: any) {
		try {
			return await prisma.groupMember.findFirst({
				where:{
					accountId: userId ? userId : "",
					groupId: securityGroupId ? securityGroupId : "",
				},
				include: {
					account: true,
				}
			});
		}catch (e:any) {
			throw new Error(e.message);
		}
	}
}

const securityGroupRepo = new SecurityGroupRepo();
export default securityGroupRepo;
