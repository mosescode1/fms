import {Router} from "express";
import {checkRolePermission, checkPermission} from '../../../middleware/permission';
import {catchAsync} from '../../../lib';
import trashController from "../../../controller/v1/trash/trash.controller"
import {Authenticate} from '../../../middleware/authenticate';
import roles from '../../../types/roles.types';
import { Permissions } from '@prisma/client';

const { SUPER_AND_ADMIN, ALL } = roles;

const router = Router();

// Get all trashed items - Admins see all, regular users see only their own
// router.get("/", Authenticate, catchAsync(trashController.getAllTrashedItems));
router.get("/", Authenticate,checkRolePermission(["SUPER_ADMIN"]), catchAsync(trashController.deletedFiles));
router.get('/analysis', Authenticate, checkRolePermission(["SUPER_ADMIN"]), catchAsync(trashController.getTrashAnalysis));

// // Restore a trashed item - Users can restore their own items, admins can restore any
router.put("/restore{/:resourceId}", Authenticate,checkRolePermission(["SUPER_ADMIN"]), catchAsync(trashController.restoreTrashItem));
//
// // Permanently delete a trashed item - Users can delete their own items, admins can delete any
router.delete("/delete{/:resourceId}", Authenticate, checkRolePermission(["SUPER_ADMIN"]), catchAsync(trashController.permanentlyDeleteItem));

export default router;
