import {Router} from "express"
import {Authenticate} from '../../../middleware/authenticate';
import permissionController from "../../../controller/v1/permmission/permission.controller"
import {catchAsync} from '../../../lib';
import { checkRolePermission } from '../../../middleware/permission';
import  roles  from '../../../types/roles.types';

const router = Router();
const { SUPER_AND_ADMIN, } = roles;

// Get all permissions
router.get(
    "/", 
    Authenticate, 
    checkRolePermission(SUPER_AND_ADMIN),
    catchAsync(permissionController.getAllPermission)
);

// Create a new permission
router.post(
    "/", 
    Authenticate, 
    checkRolePermission(SUPER_AND_ADMIN),
    catchAsync(permissionController.createPermission)
);

// Get permission by ID
router.get(
    "{/:permissionId}",
    Authenticate, 
    checkRolePermission(SUPER_AND_ADMIN),
    catchAsync(permissionController.getPermissionById)
);

// Get user permissions
router.get(
    "/user{/:userId}",
    Authenticate, 
    checkRolePermission(SUPER_AND_ADMIN),
    catchAsync(permissionController.getUserPermissions)
);

// Get group permissions
router.get(
    "/group{/:groupId}",
    Authenticate, 
    checkRolePermission(SUPER_AND_ADMIN),
    catchAsync(permissionController.getGroupPermissions)
);

// Delete permission
router.delete(
	"{/:permissionId}",
    Authenticate, 
    checkRolePermission(SUPER_AND_ADMIN),
    catchAsync(permissionController.removePermission)
);

export default router