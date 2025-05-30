import { Router } from 'express';

import { Authenticate } from '../../../middleware/authenticate';
import { checkRolePermission } from '../../../middleware/permission';
import { catchAsync } from '../../../lib';
import securityGroupPermissionController from '../../../controller/v1/securityGroup/securityGroupPermission.controller';
import securityService from '../../../service/v1/securityGroup/security.service';
import roles from '../../../types/roles.types';

const router = Router();

// get all security groups
router.get(
	'/',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupPermissionController.getAllSecurityGroups)
);

// create a security group
router.post(
	'/',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupPermissionController.createSecurityGroup)
);

// edit a security group
router.patch(
	'{/:groupId}',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupPermissionController.editSecurityGroup)
);

// delete a security group
router.delete(
	'{/:groupId}',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupPermissionController.deleteSecurityGroup)
);

// add a user to a security group
router.post(
	'{/:groupId}/add-user',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupPermissionController.addUserToGroup)
);

// get users in a security group
router.get(
	'{/:groupId/}users',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupPermissionController.getUsersInGroup));


export default router;
