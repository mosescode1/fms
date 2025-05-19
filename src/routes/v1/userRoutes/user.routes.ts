import Router from 'express';
import userController from '../../../controller/v1/user/user.controller';
import { Authenticate } from '../../../middleware/authenticate';
import { checkRolePermission } from '../../../middleware/permission';
import { catchAsync } from '../../../lib';
const router = Router();

const superAdmin = ['SUPER_ADMIN'];
const superAdminAndAdmin = ['SUPER_ADMIN', 'ADMIN'];
const adminOnly = ['ADMIN'];
const allRoles = ['SUPER_ADMIN', 'ADMIN', 'USER'];

router.get(
	'/',
	Authenticate,
	checkRolePermission(superAdminAndAdmin),
	catchAsync(userController.getAllUsers)
);
router.post(
	'/add-user',
	catchAsync(Authenticate),
	checkRolePermission(superAdminAndAdmin),
	catchAsync(userController.createNewUser)
);
router.get(
	'/me',
	Authenticate,
	checkRolePermission(allRoles),
	userController.userProfile
);
export default router;
