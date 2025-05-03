import {prisma} from "../../prisma/prisma.client";

class AuditlogRepo{
    async createAuditLog(data:any){
        try{
            return await prisma.auditLog.create({
                data,
            })
        }catch(err:any){
            throw new Error(err.message)
        }
    }

    async allAuditLogs(){
        try{
            return await prisma.auditLog.findMany({
                include:{
                    actor: true,
                    Folder: true,
                    File:true,
                },
                orderBy:{
                    createdAt: 'desc'
                }
            });
        }catch(error:any){
            throw new Error(error.message)
        }
    }

    async findAuditLogById(id: string){
        try{
            return  await prisma.auditLog.findUnique({
                where: {
                    id,
                },
                include:{
                    actor: true,
                    Folder: true,
                    File:true
                }
            });


        }catch(e:any){
            throw new Error(e.message);
        }
    }
}

export default new AuditlogRepo();