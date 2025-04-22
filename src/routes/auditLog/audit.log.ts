import Router from "express";

const router = Router();
import {Authenticate} from "../../middleware/authenticate";
import auditlogController from "../../controller/auditlog/auditlog.controller";
import {catchAsync} from "../../lib";

router.get("/", catchAsync(auditlogController.allAuditLogs));
router.get("{/:auditId}", catchAsync(auditlogController.findAuditLogById));


export default router;