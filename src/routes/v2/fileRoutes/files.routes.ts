import Router from "express";
import {Authenticate} from "../../../middleware/authenticate";
import fileController from "../../../controller/v2/file/file.controller";
import {upload} from "../../../middleware/upload";
import {catchAsync} from "../../../lib";
import {
	checkRolePermission,
	// checkPermissionLevel,
	// checkReadAccess,
	// checkWriteAccess
} from "../../../middleware/permission";

const router = Router();

const adminOnly = ["ADMIN"]
const adminAndUser = ["ADMIN", "MEMBER"]
const member = ["MEMBER"]

// router.get("/",Authenticate, catchAsync(fileController.allFiles));
// router.get("/folders",Authenticate, checkRolePermission(adminOnly), catchAsync(fileController.allFolders))
// router.get("/folders/root", Authenticate, checkRolePermission(member), checkPermissionLevel, catchAsync(fileController.getRootFolderPermissionLevel));
//
// router.get("/folders{/:folderId}", Authenticate, checkRolePermission(adminAndUser),checkReadAccess, catchAsync(fileController.getFolderById));
// router.post("/create/folder{/:parentId}",Authenticate,checkRolePermission(adminAndUser), checkWriteAccess, catchAsync(fileController.createFolder));
// router.post("/upload/file{/:parentId}",Authenticate, upload.single("file"),checkRolePermission(adminAndUser), checkWriteAccess,  catchAsync(fileController.uploadFile));

// Mark as deletion
// router.delete("/folders{/:folderId}", Authenticate, checkRolePermission(adminAndUser), checkPermissionLevel, checkWriteAccess,  catchAsync(fileController.userDeleteFolder));
// router.delete("/file{/:fileId}", Authenticate, checkRolePermission(adminAndUser), checkPermissionLevel, checkWriteAccess,  catchAsync(fileController.userDeleteFile));

// Permanent deletion and restoration of file
// router.get("/file/restore{/:fileId}", Authenticate, checkRolePermission(adminOnly),  catchAsync(fileController.userRestoreFile));
// router.delete("/file/delete{/:fileId}", Authenticate, checkRolePermission(adminOnly),  catchAsync(fileController.userDeleteFile));

export default router;