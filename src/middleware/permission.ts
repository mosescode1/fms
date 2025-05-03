import {NextFunction, Request, Response} from "express";
import {AppError} from "../lib";
import {prisma} from "../prisma/prisma.client";

const checkRolePermission = (roles: string[]) => {
    return (req: Request, _: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError({
                    message: 'You do not have permission to perform this action',
                    statusCode: 403,
                })
            );
        }
        next();
    };
};

// const hasFolderAccess = async (folderId: string, userId: string): Promise<boolean> => {
//     // Validate folder exists
//     const folderExists = await prisma.folder.findUnique({
//         where: { id: folderId },
//         select: { id: true },
//     });
//
//     if (!folderExists) {
//         throw new Error("Folder not found");
//     }
//
//     // Recursive CTE to get all ancestors including self
//     const folders = await prisma.$queryRaw<{ id: string }[]>`
//         WITH RECURSIVE folder_tree AS (
//             SELECT id, "parentId"
//             FROM "Folder"
//             WHERE id = ${folderId}
//             UNION
//             SELECT f.id, f."parentId"
//             FROM "Folder" f
//             INNER JOIN folder_tree ft ON ft."parentId" = f.id
//         )
//         SELECT id FROM folder_tree
//     `;
//
//     const folderIds = folders.map(f => f.id);
//
//     // Check if the user has permission on any folder in the chain
//     const permission = await prisma.permission.findFirst({
//         where: {
//             accountId: userId,
//             folderId: { in: folderIds }
//         },
//     });
//
//     return !!permission;
// };


// const checkFolderAccess = async (req: Request, _: Response, next: NextFunction) => {
//         try {
//             if (req.user.role !== "ADMIN") {
//                 const folderId = req.params.folderId;
//                 const userId = req.user.userId;
//
//                 const access = await hasFolderAccess(folderId, userId);
//
//                 if (!access) {
//                     return next(new AppError({
//                         message: 'You do not have permission to perform this action',
//                         statusCode: 403,
//                     }));
//                 }
//             }
//
//             next();
//         } catch (error: any) {
//             next(new AppError({
//                 message: error.message || 'Internal server error',
//                 statusCode: 500,
//             }));
//         }
// };

// check user root folder permission level
const checkPermissionLevel = async (req: Request, _: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;

        const permission = await prisma.permission.findMany({
            where: {
                accountId: userId,
            },
            select:{
                folderPath: true
            }
        });

        if (!permission) {
            return next(new AppError({
                message: 'You Have not be granted any Access As an Admin for access',
                statusCode: 403,
            }));
        }

        // Check if the user has permission on any folder in the chain
        // const folderIds = permission.map((perm) => perm.type);
        // const permission = await prisma.permission.findMany({
        //     where: {
        //         accountId: userId,
        //         folderPath: { in: folderIds }
        //     },
        // });
        // if (!permission) {
        //     return next(new AppError({
        //         message: 'You Have not be granted any Access As an Admin for access',
        //         statusCode: 403,
        //     }));
        // }
        req.user.permissionLevel = permission
            .map((perm) => perm.folderPath)
            .filter((path): path is string => path !== null)

        next();
    } catch (error: any) {
        next(new AppError({
            message: error.message || 'Internal server error',
            statusCode: 500,
        }));
    }
}

const hasFolderAccess = async (
    folderId: string,
    userId: string,
    requiredAccess: string
): Promise<boolean> => {
    const folderExists = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { id: true },
    });

    if (!folderExists) throw new Error("Folder not found");

    const folders = await prisma.$queryRaw<{ id: string }[]>`
        WITH RECURSIVE folder_tree AS (
            SELECT id, "parentId"
            FROM "Folder"
            WHERE id = ${folderId}
            UNION
            SELECT f.id, f."parentId"
            FROM "Folder" f
            INNER JOIN folder_tree ft ON ft."parentId" = f.id
        )
        SELECT id FROM folder_tree
    `;

    const folderIds = folders.map(f => f.id);

    const permissions = await prisma.permission.findMany({
        where: {
            accountId: userId,
            folderId: { in: folderIds }
        },
    });

    return permissions.some(p => {
        if (requiredAccess === 'ReadOnly') return true;
        if (requiredAccess === 'ReadAndWrite') return p.type === 'ReadAndWrite';
        return false;
    });
};


const checkReadAccess = async (req: Request, _: Response, next: NextFunction) => {
    try {
        if (req.user.role !== "ADMIN") {
            const folderId = req.params.folderId;
            const userId = req.user.userId;

            const access = await hasFolderAccess(folderId, userId, "ReadOnly");
            if (!access) {
                return next(new AppError({ message: "Read access denied", statusCode: 403 }));
            }
        }

        next();
    } catch (err:any) {
        return next(new AppError({ message: err.message || "Server error", statusCode: 500 }));
    }
};

const checkWriteAccess = async (req: Request, _: Response, next: NextFunction) => {
    try {
        if (req.user.role !== "ADMIN") {
            const folderId = req.params.parentId;
            const userId = req.user.userId;

            // if (!folderId)
            const access = await hasFolderAccess(folderId, userId, "ReadAndWrite");
            if (!access) {
                return next(new AppError({ message: "Write access denied", statusCode: 403 }));
            }
        }

        next();
    } catch (err:any) {
        return next(new AppError({ message: err.message || "Server error", statusCode: 500 }));
    }
};

export  {
    checkRolePermission,
    checkReadAccess,
    checkWriteAccess,
    checkPermissionLevel
    // hasAccess,
};
