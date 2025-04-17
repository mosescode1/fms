import Router from "express";
import {Authenticate} from "../../middleware/authenticate";
import fileController from "../../controller/file/file.controller";
import {upload} from "../../middleware/upload";
import {catchAsync} from "../../lib";

const router = Router();

router.get("/",Authenticate, catchAsync(fileController.allFiles));
router.get("/folders",Authenticate, catchAsync(fileController.allFolders));
router.post("/create/folder{/:parentId}",Authenticate, catchAsync(fileController.createFolder));
router.post("/upload/file{/:parentId}",Authenticate, upload.single("file"), catchAsync(fileController.uploadFile));





export default router;