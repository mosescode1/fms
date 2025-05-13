import Router from "express";
import organizationController from "../../../controller/v1/organization/organization.controller";
import {Authenticate} from "../../../middleware/authenticate";

const router = Router();


router.post("/", Authenticate, organizationController.createOrganization)



export default router;