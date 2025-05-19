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

// get all users
router.get(
	'/',
	Authenticate,
	checkRolePermission(superAdminAndAdmin),
	catchAsync(userController.getAllUsers)
);

// Create a new User
router.post(
	'/add-user',
	catchAsync(Authenticate),
	checkRolePermission(superAdminAndAdmin),
	catchAsync(userController.createNewUser)
);

// give a user permissions
router.post(
	'/permission{/:id}',
	Authenticate,
	checkRolePermission(superAdminAndAdmin),
	catchAsync(userController.giveUserPermissions)
);

router.get(
	'/me',
	Authenticate,
	checkRolePermission(allRoles),
	userController.userProfile
);

export default router;
