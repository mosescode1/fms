import { prisma } from '../../../prisma/prisma.client';

class SecurityGroupRepo {
	// get all security group
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

	// create security group
	async createSecurityGroup(data: any) {
		try {
			return await prisma.securityGroup.create({
				data: {
					name: data.name,
					description: data.description,
					acls: {
						create: data.acls,
					},
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

	// edit security group
	async editSecurityGroup(id: string, data: any) {
		try {
			return await prisma.securityGroup.update({
				where: {
					id,
				},
				data: {
					name: data.name,
					description: data.description,
					acls: {
						updateMany: data.acls,
					},
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
}

const securityGroupRepo = new SecurityGroupRepo();
export default securityGroupRepo;
