import { Response, Request, NextFunction } from 'express';
import securityService from '../../../service/v1/securityGroup/security.service';
import { AppError } from '../../../lib';
import reqValidator from '../../../lib/reqValidator';

class SecurityGroupController {
	/**
	 * @desc Get all security groups
	 * @route GET /api/v1/security-group
	 * @access only admin and super_admin
	 */
	async getAllSecurityGroups(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<any> {}
	/**
	 * @desc Get all security groups
	 * @route GET /api/v1/security-group
	 * @access only admin and super_admin
	 */
	async createSecurityGroup(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<any> {}

	/**
	 *
	 * @desc Add users to the security group
	 * @param req
	 * @param res
	 * @param next
	 */
	async addUserToGroup(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<any> {}

	/**
	 * @desc Edit a security group
	 * @param req
	 * @param res
	 * @param next
	 */
	async editSecurityGroup(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<any> {}

	/**
	 * @desc Delete a security group
	 * @param req
	 * @param res
	 * @param next
	 */
	async deleteSecurityGroup(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<any> {}
}

const securityGroupController = new SecurityGroupController();
export default securityGroupController;
