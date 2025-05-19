import securityGroupRepo from 'repository/v1/securityGroup/security.repo';

class SecurityGroupService {
	// get all security group
	async allSecurityGroups() {
		return await securityGroupRepo.allSecurityGroups();
	}
	// create security group with permissions
	async createSecurityGroup() {
		// create security group
		// check if security group already exists
		// if yes, throw error
		// if no, create security group
		// add permissions to the security group
	}
	// edit security group
	async editSecurityGroup() {
		// edit security group
		// check if security group exists
		// if not, throw error
		// if yes, update security group
	}
	// add user to security group
	async addUsersTosecurityGroups() {
		// add user to security group
		// check if user is already in the group
		// if not, add user to the group
	}
	// delete security group
}

const securityGroupService = new SecurityGroupService();
export default securityGroupService;
