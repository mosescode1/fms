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

	// add users to a security group
	async addUsersToSecurityGroups(data:any) {
		// check if a security group exists
		const securityGroup = await securityGroupRepo.getSecurityGroupById(data.securityGroupId);
		// if not, throw error
		if (!securityGroup) {
			throw new AppError({ message: 'Security group not found', statusCode: 404 });
		}

		// Process array of user IDs
		const results = [];
		const errors = [];

		// Validate that userIds is an array
		if (!Array.isArray(data.userIds)) {
			throw new AppError({ message: 'User IDs must be an array', statusCode: 400 });
		}

		// Process each user ID
		for (const userId of data.userIds) {
			try {
				// Check if user exists
				const user = await userRepo.findUserById(userId);
				if (!user) {
					errors.push({ userId, message: 'User not found', statusCode: 404 });
					continue;
				}

				// Check if user is already in the group
				const userInGroup = await securityGroupRepo.getUserInGroup(userId, data.securityGroupId);
				if (userInGroup) {
					errors.push({ name: userInGroup.account.fullName, message: 'User already in group', statusCode: 409 });
					continue;
				}

				// Add user to the group
				const result = await securityGroupRepo.addUsersTosecurityGroups({
					userId,
					securityGroupId: data.securityGroupId
				});
				results.push(result);
			} catch (error:any) {
				errors.push({ userId, message: error.message, statusCode: 500 });
			}
		}

		return {
			results,
			errors,
			success: results.length,
			failed: errors.length
		};
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

	// get users in a security group
	async getUsersInGroup(groupId: string) {
		// check if a security group exists
		const securityGroup = await securityGroupRepo.getSecurityGroupById(groupId);
		if (!securityGroup) {
			throw new AppError({ message: 'Security group not found', statusCode: 404 });
		}
		// if yes, get users in the security group
		return await securityGroupRepo.getUsersInGroup(groupId);
	}
}

const securityGroupService = new SecurityGroupService();
export default securityGroupService;
