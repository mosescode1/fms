import Router from "express";

const router = Router();
import {Authenticate} from "../../../middleware/authenticate";
import auditlogController from "../../../controller/v1/auditlog/auditlog.controller";
import {catchAsync} from "../../../lib";

router.get("/", Authenticate,catchAsync(auditlogController.allAuditLogs));
router.get("{/:auditId}", Authenticate,catchAsync(auditlogController.findAuditLogById));


export default router;