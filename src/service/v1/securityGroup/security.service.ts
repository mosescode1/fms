import securityGroupRepo from '../../../repository/v1/securityGroup/security.repo';
import { AppError } from '../../../lib';
import userRepo from '../../../repository/v1/user/user.repo';



class SecurityGroupService {
	// get all security groups
	async allSecurityGroups() {
		return await securityGroupRepo.allSecurityGroups();
	}
	// create a security group with permissions
	async createSecurityGroup(data: any) {
		// check if a security group already exists
		const existingGroup = await securityGroupRepo.getSecurityGroupByName(data.name);
		if (existingGroup){
			throw new AppError({message:"Security group already exists", statusCode: 409});
		}
		// if no, create a security group
		return  await securityGroupRepo.createSecurityGroup(data);
	}

	// edit a security group
	async editSecurityGroup(id: string, data: any) {
		// edit a security group
		// check if a security group already exists
		const existingGroup = await securityGroupRepo.getSecurityGroupById(id);
		if (!existingGroup) {
			throw new AppError({ message: 'Security group not found', statusCode: 404 });
		}
		// if yes, update a security group
		return await securityGroupRepo.editSecurityGroup(id, data);
	}

	// add a user to a security group
	async addUsersToSecurityGroups(data:any) {
		// check if a security group exists
		const securityGroup = await securityGroupRepo.getSecurityGroupById(data.securityGroupId);
		// if not, throw error
		if (!securityGroup) {
			throw new AppError({ message: 'Security group not found', statusCode: 404 });
		}
		// if yes, check if a user exists

		const user = await userRepo.findUserById(data.userId);
		// if not, throw error
		if (!user) {
			throw new AppError({ message: 'User not found', statusCode: 404 });
		}

		// if yes, check if a user is already in the group
		const userInGroup = await securityGroupRepo.getUserInGroup(data.userId, data.securityGroupId);

		if (userInGroup) {
			throw new AppError({ message: 'User already in group', statusCode: 409 });
		}

		// if not, add a user to the group
		return await securityGroupRepo.addUsersTosecurityGroups(data);
	}


	// delete a security group
	async deleteSecurityGroup(groupId: string) {
		const securityGroup = await securityGroupRepo.getSecurityGroupById(groupId);
		if (!securityGroup) {
			throw new AppError({ message: 'Security group not found', statusCode: 404 });
		}
		// if yes, delete a security group
		return await securityGroupRepo.deleteSecurityGroup(groupId);
	}
}

const securityGroupService = new SecurityGroupService();
export default securityGroupService;
