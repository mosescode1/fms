import { Router } from 'express';

import { Authenticate } from '../../../middleware/authenticate';
import { checkRolePermission } from '../../../middleware/permission';
import { catchAsync } from '../../../lib';
import securityGroupPermissionController from '../../../controller/v1/securityGroup/securityGroupPermission.controller';
import roles from '../../../types/roles.types';

const router = Router();

// get all security groups
router.get(
	'/',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupController.getAllSecurityGroups)
);

// create a security group and add permissions
router.post(
	'/',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupController.createSecurityGroup)
);

// edit a security group
router.patch(
	'{/:id}',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupController.editSecurityGroup)
);

// delete a security group
router.delete(
	'/:id',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupController.deleteSecurityGroup)
);

// add user to a security group
router.post(
	'{/:id}/add-user',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupController.addUserToGroup)
);

// give permissions to a security group
router.post(
	'/:id/permissions',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(securityGroupPermissionController.giveSecurityGroupPermissions)
);

export default router;
