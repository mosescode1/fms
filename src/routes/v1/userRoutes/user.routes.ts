import Router from 'express';
import userController from '../../../controller/v1/user/user.controller';
import { Authenticate } from '../../../middleware/authenticate';
import { checkRolePermission } from '../../../middleware/permission';
import { catchAsync } from '../../../lib';
const router = Router();

const superAdmin = ['SUPER_ADMIN'];
const allRoles = ['SUPER_ADMIN', 'ADMIN', 'USER'];

// get all users
router.get(
	'/',
	Authenticate,
	checkRolePermission(superAdmin),
	catchAsync(userController.getAllUsers)
);

// Create a new User
router.post(
	'/add-user',
	catchAsync(Authenticate),
	checkRolePermission(superAdmin),
	catchAsync(userController.createNewUser)
);

// give a user permissions
router.post(
	'/permission{/:id}',
	Authenticate,
	checkRolePermission(superAdmin),
	catchAsync(userController.giveUserPermissions)
);

// profile
router.get(
	'/me',
	Authenticate,
	checkRolePermission(allRoles),
	userController.userProfile
);


// admin dashboard
router.get(
	'/admin/dashboard',
	Authenticate,
	checkRolePermission(superAdmin),
	catchAsync(userController.adminDashboard)
);


router.get(
	'/member/dashboard',
	Authenticate,
	checkRolePermission(['ADMIN', 'USER']),
	catchAsync(userController.memberDashboard)
)

export default router;
