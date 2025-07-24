import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib';
import { prisma } from '../prisma/prisma.client';
import { Permissions, ResourceType } from '@prisma/client';

// check Role Permission Middleware
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


const checkFolderWithInheritance = async (folderId: string, resourceType: ResourceType, requiredPermission:Permissions, userId:string, groupIds: string[]): Promise<boolean> => {
	const acl=  await prisma.aclEntry.findFirst({
		where: {
			resourceType: resourceType,
			permissions: { has: requiredPermission },
			OR: [{ accountId: userId }, { groupId: { in: groupIds } }],
			folderId,
		},
	});
	return !!acl;
};

const checkFileWithInheritance = async (fileId: string, resourceType: ResourceType, requiredPermission:Permissions, userId:string, groupIds: string[]): Promise<boolean> => {
	const acl = await prisma.aclEntry.findFirst({
		where: {
			resourceType: resourceType,
			permissions: { has: requiredPermission },
			OR: [{ accountId: userId }, { groupId: { in: groupIds } }],
			fileId,
		},
	});
	return !!acl;
}

const generateRedisPermissionKey = (userId: string, resourceType: ResourceType, resourceId: string, requiredPermission: Permissions): string => {
	return `permission:${userId}:${resourceType}:${resourceId}:${requiredPermission}`;
}

// recursive function to check if user has permission on a resource or its parent folder
export const hasPermission = async (
	userId: string,
	resourceType: ResourceType,
	resourceId: string,
	requiredPermission: Permissions
): Promise<boolean> => {
	// Get user's group IDs
	const groupMemberships = await prisma.groupMember.findMany({
		where: { accountId: userId },
		select: { groupId: true },
	});
	const groupIds = groupMemberships.map((g) => g.groupId);


	// recursive check for file and folder permissions recursively
	if( resourceType === ResourceType.FILE) {
		// File resource: check directly and inherit upward
		const acl = await checkFileWithInheritance(resourceId, resourceType, requiredPermission, userId, groupIds);
		
		if (acl) {
			return true;
		}
		// Check parent folder if any
		const file = await prisma.file.findUnique({
			where: {id: resourceId},
			select: {folderId: true},
		});

		if (file?.folderId) {
			// recursively check the parent folder for permissions
			return await  hasPermission(userId,ResourceType.FOLDER, file.folderId, requiredPermission);
		}
	}else if (resourceType === ResourceType.FOLDER) {

		const acl = await checkFolderWithInheritance(resourceId, resourceType, requiredPermission, userId, groupIds);

		if (acl) {
			return true;
		}

		// check parent folder recursively
		const folder = await prisma.folder.findUnique({
			where: { id: resourceId },
			select: { parentId: true },
		});
		if (folder?.parentId) {
			return await hasPermission(userId, ResourceType.FOLDER, folder.parentId, requiredPermission);
		}
	}

	return false;
};


const checkPermission = (requiredPermission: Permissions) => {
	return async (req: Request, res: Response, next: NextFunction) => {

		let resourceType: ResourceType | undefined;
		// get resource type from query params
		const resourceTypeFromQuery = req.query.resourceType as ResourceType;

		if (resourceTypeFromQuery) {
			resourceType = resourceTypeFromQuery;
		}

		if (!resourceType) {
			return next(
				new AppError({
					message: 'Resource type is required',
					statusCode: 400,
				})
			);
		}

		const resourceId = req.params.resourceId as string;
		const user = req.user;

		if (user.role === 'SUPER_ADMIN') {
			return next();
		}

		if (!resourceId) {
			return next(
				new AppError({
					message: 'Missing resource ID',
					statusCode: 400,
				})
			);
		}

		const hasAccess = await hasPermission(
			user.userId,
			resourceType,
			resourceId,
			requiredPermission
		);

		console.log(`hasAccess: ${hasAccess}`);
		if (!hasAccess) {
			return next(
				new AppError({
					message: `You do not have ${requiredPermission} access to this ${resourceType.toLowerCase()}`,
					statusCode: 403,
				})
			);
		}

		return next();
	};
};

const checkAclEntryResources = async (
	req: Request,
	_: Response,
	next: NextFunction
) => {
	try {
		const { resourceType, folderId, folderIds, fileId, fileIds } = req.body;

		// Skip check for super admins
		if (req.user.role === 'SUPER_ADMIN') {
			return next();
		}

		// Check if the resource exists based on resourceType
		if (resourceType === ResourceType.FOLDER) {
			// Handle array of folderIds
			if (folderIds && Array.isArray(folderIds)) {
				for (const id of folderIds) {
					const folder = await prisma.folder.findUnique({
						where: { id },
						select: { id: true, accountId: true },
					});

					if (!folder) {
						return next(
							new AppError({
								message: `Folder with ID ${id} not found`,
								statusCode: 404,
							})
						);
					}
				}
			} 
			// Handle single folderId for backward compatibility
			else if (folderId) {
				const folder = await prisma.folder.findUnique({
					where: { id: folderId },
					select: { id: true, accountId: true },
				});

				if (!folder) {
					return next(
						new AppError({
							message: 'Folder not found',
							statusCode: 404,
						})
					);
				}
			}

			// Check if a user is the owner or an admin
			// if (req.user.role !== 'ADMIN' && folder.accountId !== req.user.userId) {
			// 	return next(
			// 		new AppError({
			// 			message: 'You do not have permission to manage access for this folder',
			// 			statusCode: 403,
			// 		})
			// 	);
			// }
		} else if (resourceType === ResourceType.FILE) {
			// Handle array of fileIds
			if (fileIds && Array.isArray(fileIds)) {
				for (const id of fileIds) {
					const file = await prisma.file.findUnique({
						where: { id },
						select: { id: true, accountId: true },
					});

					if (!file) {
						return next(
							new AppError({
								message: `File with ID ${id} not found`,
								statusCode: 404,
							})
						);
					}

					// Check if user is the owner or an admin
					if (req.user.role !== 'ADMIN' && file.accountId !== req.user.userId) {
						return next(
							new AppError({
								message:
									'You do not have permission to manage access for this file',
								statusCode: 403,
							})
						);
					}
				}
			}
			// Handle single fileId for backward compatibility
			else if (fileId) {
				const file = await prisma.file.findUnique({
					where: { id: fileId },
					select: { id: true, accountId: true },
				});

				if (!file) {
					return next(
						new AppError({
							message: 'File not found',
							statusCode: 404,
						})
					);
				}

				// Check if user is the owner or an admin
				if (req.user.role !== 'ADMIN' && file.accountId !== req.user.userId) {
					return next(
						new AppError({
							message:
								'You do not have permission to manage access for this file',
							statusCode: 403,
						})
					);
				}
			}
		} else {
			return next(
				new AppError({
					message: 'Invalid resource type or missing resource ID',
					statusCode: 400,
				})
			);
		}

		next();
	} catch (error: any) {
		next(
			new AppError({
				message: error.message || 'Error checking resource permissions',
				statusCode: 500,
			})
		);
	}
};

export {
	checkRolePermission,
	checkPermission,
	// checkFileAccessPermission,
	checkAclEntryResources,
};
