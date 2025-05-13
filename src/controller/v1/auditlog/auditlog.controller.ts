import auditlogService from "../../../service/v1/auditLog/audit_log.service";
import { Request, Response } from "express";
class AuditlogController {

    async allAuditLogs(req:Request, res: Response) {
        const logs = await auditlogService.allAuditLogs();
        res.status(200).json({
            status: "success",
            data: {
                logs
            }
        });
    }

    async findAuditLogById(req:Request, res:Response){
        const { auditId } = req.params;
        const log = await auditlogService.findAuditLogById(auditId);
        if (!log) {
            return res.status(404).json({
                status: "fail",
                message: "Audit log not found",
            });
        }
        res.status(200).json({
            status: "success",
            data: {
                log
            }
        });
    }
}


export default new AuditlogController();