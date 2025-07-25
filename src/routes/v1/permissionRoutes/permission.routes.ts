import {Router} from "express"
import {Authenticate} from '../../../middleware/authenticate';
import permissionController from "../../../controller/v1/permission/permission.controller"
import {catchAsync} from '../../../lib';
import { Permissions } from '@prisma/client';

import {checkRolePermission, checkAclEntryResources, checkPermission} from '../../../middleware/permission';
import  roles  from '../../../types/roles.types';

const router = Router();
const { SUPER_ADMIN } = roles;

// Get all permissions
router.get(
    "/", 
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
	// checkPermission(Permissions.MANAGE_PERMISSIONS),
    catchAsync(permissionController.getAllPermission)
);

router.post("/member",
	Authenticate,
	checkRolePermission(SUPER_ADMIN),
	checkAclEntryResources,
	catchAsync(permissionController.createMemberPermission))

// Create a new permission on a group for folder (single folder - for backward compatibility)
router.post(
    "/group/folder", 
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
    checkAclEntryResources,
    catchAsync(permissionController.createPermissionGroup)
);

// create a new permission on a group for file
router.post(
    "/group/file", 
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
    checkAclEntryResources,
    catchAsync(permissionController.createPermissionGroup)
);

// Create a new permission on group for files array
router.post(
    "/group/files", 
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
    checkAclEntryResources,
    catchAsync(permissionController.createPermissionGroup)
);

// create a new permission on user for folder
router.post(
    "/user/folder", 
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
    checkAclEntryResources,
    catchAsync(permissionController.createPermissionGroup)
);

// create a new permission on user for file
router.post(
    "/user/file", 
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
    checkAclEntryResources,
    catchAsync(permissionController.createPermissionGroup)
);

// Get permission by ID
router.get(
    "{/:permissionId}",
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
    catchAsync(permissionController.getPermissionById)
);

// get users in the permission by id
router.get(
	"{/:permissionId/}users",
	Authenticate,
	checkRolePermission(SUPER_ADMIN),
	catchAsync(permissionController.getPermissionUsers)
);

// Get user permissions
router.get(
    "/user{/:userId}",
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
    catchAsync(permissionController.getUserPermissions)
);

// Get group permissions
router.get(
    "/group{/:groupId}",
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
    catchAsync(permissionController.getGroupPermissions)
);


// Delete permission
router.delete(
	"{/:permissionId}",
    Authenticate, 
    checkRolePermission(SUPER_ADMIN),
    catchAsync(permissionController.removePermission)
);

export default router
