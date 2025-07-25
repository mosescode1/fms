import Router from 'express';
import { Authenticate } from '../../../middleware/authenticate';
import fileController from '../../../controller/v2/file/file.controller';
import trashController from '../../../controller/v1/trash/trash.controller';
import { upload } from '../../../middleware/upload';
import { catchAsync } from '../../../lib';
import roles from '../../../types/roles.types';
import { Permissions } from '@prisma/client';
import {
	checkRolePermission,
	checkPermission,
} from '../../../middleware/permission';

const router = Router();

router.get(
	'/',
	Authenticate,
	checkRolePermission(roles.SUPER_ADMIN),
	catchAsync(fileController.allFiles)
);
// Returns all the files accessible to that user
router.get(
	'/accessible',
	Authenticate,
	checkRolePermission(roles.ALL),
	catchAsync(fileController.accessFiles)
);

router.get(
	'/folders',
	Authenticate,
	checkRolePermission(roles.SUPER_ADMIN),
	catchAsync(fileController.allFolders)
);

// open a file by ID
router.get(
	'/:resourceId',
	Authenticate,
	checkRolePermission(roles.ALL),
	checkPermission(Permissions.OPEN_FILE),
	catchAsync(fileController.getFileById)
);

// Create a new folder
router.post(
	'/create/folder{/:resourceId}',
	Authenticate,
	checkRolePermission(roles.ALL),
	checkPermission(Permissions.CREATE_FOLDER),
	catchAsync(fileController.createFolder)
);

//Open a folder by ID
router.get(
	'/folders{/:resourceId}',
	Authenticate,
	checkRolePermission(roles.ALL),
	checkPermission(Permissions.OPEN_FOLDER),
	catchAsync(fileController.getFolderById)
);


// upload file and folder
router.post(
	'/upload/file{/:resourceId}',
	Authenticate,
	upload.array('files'),
	checkRolePermission(roles.ALL),
	checkPermission(Permissions.UPLOAD_FILE),
	catchAsync(fileController.uploadFiles)
);


// upload folder
router.post(
	'/upload/folder{/:resourceId}',
	Authenticate,
	upload.array('files'),
	checkRolePermission(roles.ALL),
	checkPermission(Permissions.UPLOAD_FOLDER),
	catchAsync(fileController.uploadFolders)
);



// Mark as deletion
router.delete("/folders{/:resourceId}", Authenticate, checkRolePermission(roles.ALL), checkPermission(Permissions.DELETE_FOLDER), catchAsync(fileController.userDeleteFolder));
router.delete("/file{/:resourceId}", Authenticate, checkRolePermission(roles.ALL), checkPermission(Permissions.DELETE_FILE), catchAsync(fileController.userDeleteFile));

// Permanent deletion and restoration of file
router.get("/", Authenticate, catchAsync(trashController.getAllTrashedItems));
router.put("/file/restore{/:resourceId}", Authenticate, checkRolePermission(roles.SUPER_ADMIN), catchAsync(trashController.restoreTrashItem));
router.delete("/file/delete{/:resourceId}", Authenticate, checkRolePermission(roles.SUPER_ADMIN), catchAsync(trashController.permanentlyDeleteItem));

export default router;
