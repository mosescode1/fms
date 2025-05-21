import {Router} from "express";
import {checkRolePermission} from '../../../middleware/permission';
import {catchAsync} from '../../../lib';
import trashController from "../../../controller/v1/trash/trash.controller"
import {Authenticate} from '../../../middleware/authenticate';

const router = Router();

// const adminOnly  = ["ADMIN", "SUPER_ADMIN"]
// router.get("/", Authenticate, checkFileAccessPermission, checkRolePermission(adminOnly), catchAsync(trashController.getAllTrashedItems));
// router.put("/restore{/:itemId}", Authenticate, checkFileAccessPermission, checkRolePermission(adminOnly), catchAsync(trashController.restoreTrashItem))
// router.delete("/delete{/:trashId}", Authenticate, checkFileAccessPermission, checkRolePermission(adminOnly), catchAsync(trashController.permanentlyDeleteItem));

export default router;
