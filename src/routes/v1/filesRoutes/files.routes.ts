import Router from 'express';
import { Authenticate } from '../../../middleware/authenticate';
import fileController from '../../../controller/v1/file/file.controller';
import { upload } from '../../../middleware/upload';
import roles from '../../../types/roles.types';
import { catchAsync } from '../../../lib';
import {
	checkRolePermission,
	// checkPermissionLevel,
	// checkReadAccess,
	// checkWriteAccess,
} from '../../../middleware/permission';

const router = Router();

// Get all files and folders
router.get("/", Authenticate, catchAsync(fileController.allFiles));
router.get(
	'/folders',
	Authenticate,
	checkRolePermission(roles.SUPER_AND_ADMIN),
	catchAsync(fileController.allFolders)
);
router.get("/folders/root", Authenticate, catchAsync(fileController.getRootFolderPermissionLevel));

// Get folder by ID
router.get("/folders/:folderId", Authenticate, catchAsync(fileController.getFolderById));

// Create folder and upload file
router.post("/create/folder/:parentId?", Authenticate, catchAsync(fileController.createFolder));
router.post("/upload/file/:parentId?", Authenticate, upload.single("file"), catchAsync(fileController.uploadFile));

// Move files and folders
// router.post("/move/file/:fileId", Authenticate, catchAsync(fileController.moveFile));
// router.post("/move/folder/:folderId", Authenticate, catchAsync(fileController.moveFolder));
//
// // Copy files and folders
// router.post("/copy/file/:fileId", Authenticate, catchAsync(fileController.copyFile));
// router.post("/copy/folder/:folderId", Authenticate, catchAsync(fileController.copyFolder));
//
// // Rename files and folders
// router.post("/rename/file/:fileId", Authenticate, catchAsync(fileController.renameFile));
// router.post("/rename/folder/:folderId", Authenticate, catchAsync(fileController.renameFolder));
//
// // Mark as deletion
// router.delete("/folders/:folderId", Authenticate, catchAsync(fileController.userDeleteFolder));

// Uncomment and implement these as needed
// router.delete("/file/:fileId", Authenticate, catchAsync(fileController.userDeleteFile));
// router.get("/file/restore/:fileId", Authenticate, catchAsync(fileController.userRestoreFile));
// router.delete("/file/delete/:fileId", Authenticate, catchAsync(fileController.userDeleteFile));

export default router;
