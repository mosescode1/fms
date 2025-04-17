export type AuditLogData = {
    action: string;
    usersId: string;
    fileId?: string | null;
    folderId?: string | null;
}

