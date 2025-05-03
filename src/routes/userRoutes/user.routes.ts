import Router from "express";
import userController from "../../controller/user/user.controller";
import {Authenticate} from "../../middleware/authenticate";
import {checkRolePermission} from "../../middleware/permission"
import {catchAsync} from '../../lib';
const router = Router();


const adminOnly = ["ADMIN"]

router.get("/", Authenticate, checkRolePermission(adminOnly),catchAsync(userController.getAllUsers));
router.post("/add-user", catchAsync(Authenticate),checkRolePermission(adminOnly),catchAsync(userController.createNewUser))
router.get("/me",Authenticate, userController.userProfile);
export default router;
