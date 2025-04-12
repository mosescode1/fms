import Router from "express";
import userController from "../../controller/user/user.controller";
import {Authenticate} from "../../middleware/authenticate";

const router = Router();


router.get("/me",Authenticate, userController.userProfile);

export default router;