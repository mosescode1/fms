import auditlogRepo from "../../../repository/v1/auditLog/auditlog.repo";
import {AuditLogData} from "../../../types/auditlog.types";
class AuditLogService {

    async createAuditLog(auditLogData: AuditLogData) {
        try {
            const validData = {
                action: auditLogData.action,
                actorId: auditLogData.actorId,
                targetId: auditLogData.targetId,
                targetType: auditLogData.targetType,
                folderId: auditLogData.folderId,
                fileId: auditLogData.fileId,
            }
            return await auditlogRepo.createAuditLog(validData);
        } catch (error:any) {
            throw new Error(error.message);
        }
    }


    async allAuditLogs() {
        try {
            const res = await auditlogRepo.allAuditLogs();
            return res.map((auditLog: any) => {
                (auditLog.actor.password) = undefined;
                return {
                    ...auditLog,
                }
            });
        } catch (error:any) {
            throw new Error(error.message);
        }
    }

    async findAuditLogById(auditId: any) {
        try{
            return await auditlogRepo.findAuditLogById(auditId);
        }catch(error:any) {
            throw new Error(error.message);
        }
    }
}


const auditLogService = new AuditLogService();
export default auditLogService;