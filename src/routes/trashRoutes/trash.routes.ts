import {Router} from "express";
import {checkPermissionLevel, checkRolePermission} from '../../middleware/permission';
import {catchAsync} from '../../lib';
import trashController from "../../controller/trash/trash.controller"
import {Authenticate} from '../../middleware/authenticate';

const router = Router();

const adminOnly  = ["ADMIN"]
router.get("/", Authenticate, checkRolePermission(adminOnly), catchAsync(trashController.getAllTrashedItems));
router.put("/restore{/:itemId}", Authenticate, checkRolePermission(adminOnly), catchAsync(trashController.restoreTrashItem))

export default router;