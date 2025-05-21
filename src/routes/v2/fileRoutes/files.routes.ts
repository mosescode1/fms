import Router from "express";
import {Authenticate} from "../../../middleware/authenticate";
import fileController from "../../../controller/v2/file/file.controller";
import {upload} from "../../../middleware/upload";
import {catchAsync} from "../../../lib";
import roles from "../../../types/roles.types";
import { Permissions } from '@prisma/client';
import {
	checkRolePermission,
	checkPermission,
} from "../../../middleware/permission";

const router = Router();


router.get("/",Authenticate, checkRolePermission(roles.SUPER_ADMIN), catchAsync(fileController.allFiles));
router.get("/folders",Authenticate, checkRolePermission(roles.SUPER_ADMIN), catchAsync(fileController.allFolders))
//
router.post("/create/folder{/:parentId}",Authenticate,  checkRolePermission(roles.ALL), checkPermission(Permissions.MANAGE_PERMISSIONS) ,catchAsync(fileController.createFolder));
router.get("/folders{/:folderId}", Authenticate, checkRolePermission(roles.ALL), checkPermission(Permissions.MANAGE_PERMISSIONS), catchAsync(fileController.getFolderById));
router.post("/upload/file{/:parentId}",Authenticate, upload.single("file"), checkRolePermission(roles.ALL),checkPermission(Permissions.MANAGE_PERMISSIONS), catchAsync(fileController.uploadFile));

// get all files and folder that a user has access to
router.get("/access", Authenticate, checkRolePermission(roles.ALL), catchAsync(fileController.accessFiles));

// Mark as deletion
// router.delete("/folders{/:folderId}", Authenticate, checkRolePermission(adminAndUser), checkPermissionLevel, checkWriteAccess,catchAsync(fileController.userDeleteFolder));
// router.delete("/file{/:fileId}", Authenticate, checkRolePermission(adminAndUser), checkPermissionLevel, checkWriteAccess,catchAsync(fileController.userDeleteFile));

// Permanent deletion and restoration of file
// router.get("/file/restore{/:fileId}", Authenticate, checkRolePermission(adminOnly),  catchAsync(fileController.userRestoreFile));
// router.delete("/file/delete{/:fileId}", Authenticate, checkRolePermission(adminOnly),  catchAsync(fileController.userDeleteFile));

export default router;