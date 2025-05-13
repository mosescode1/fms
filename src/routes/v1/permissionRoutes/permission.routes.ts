import {Router} from "express"
import {Authenticate} from '../../../middleware/authenticate';
import permissionController from "../../../controller/v1/permmission/permission.controller"
import {catchAsync} from '../../../lib';

const router = Router()


router.get("/", Authenticate, catchAsync( permissionController.getAllPermission))
router.post("/", Authenticate, catchAsync( permissionController.createPermission))




export default router