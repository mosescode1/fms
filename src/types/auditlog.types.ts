export type AuditLogData = {
    action: string;
    actorId: string | null;
    targetId: string;
    targetType: string;
    folderId?: string | null;
    fileId?: string | null;
}

