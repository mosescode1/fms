import Router from "express";
import {Authenticate} from "../../../middleware/authenticate";
import fileController from "../../../controller/v2/file/file.controller";
import {upload} from "../../../middleware/upload";
import {catchAsync} from "../../../lib";
import roles from "../../../types/roles.types";
import {
	checkRolePermission,
	// checkPermissionLevel,
	// checkReadAccess,
	// checkWriteAccess
} from "../../../middleware/permission";

const router = Router();


router.get("/",Authenticate,checkRolePermission(roles.SUPER_ADMIN), catchAsync(fileController.allFiles));
router.get("/folders",Authenticate, checkRolePermission(roles.SUPER_ADMIN), catchAsync(fileController.allFolders))
// router.get("/folders/root", Authenticate, checkRolePermission(roles.ALL), catchAsync(fileController.getRootFolderPermissionLevel));

router.post("/create/folder{/:parentId}",Authenticate,checkRolePermission(roles.ALL),catchAsync(fileController.createFolder));
router.get("/folders{/:folderId}", Authenticate, checkRolePermission(roles.ALL), catchAsync(fileController.getFolderById));
router.post("/upload/file{/:parentId}",Authenticate, upload.single("file"),checkRolePermission(roles.ALL),  catchAsync(fileController.uploadFile));

// Mark as deletion
// router.delete("/folders{/:folderId}", Authenticate, checkRolePermission(adminAndUser), checkPermissionLevel, checkWriteAccess,  catchAsync(fileController.userDeleteFolder));
// router.delete("/file{/:fileId}", Authenticate, checkRolePermission(adminAndUser), checkPermissionLevel, checkWriteAccess,  catchAsync(fileController.userDeleteFile));

// Permanent deletion and restoration of file
// router.get("/file/restore{/:fileId}", Authenticate, checkRolePermission(adminOnly),  catchAsync(fileController.userRestoreFile));
// router.delete("/file/delete{/:fileId}", Authenticate, checkRolePermission(adminOnly),  catchAsync(fileController.userDeleteFile));

export default router;