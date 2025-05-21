import { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib';
import { prisma } from '../prisma/prisma.client';
import { Permissions, ResourceType } from '@prisma/client';

//
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

	const groupIds = groupMemberships.map(g => g.groupId);

	// Check if any group ACL entry grants the permission
	const matchingAcl = await prisma.aclEntry.findFirst({
		where: {
			resourceType,
			permissions: { has: requiredPermission },
			OR: [
				{ accountId: userId },
				{ groupId: { in: groupIds } }
			],
			...(resourceType === 'FILE' ? { fileId: resourceId } : { folderId: resourceId })
		},
	});

	return !!matchingAcl;
};


const checkPermission = (requiredPermission: Permissions) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const { resourceType, folderId, fileId } = req.body;
		const resourceId = resourceType === 'FILE' ? fileId : folderId;
		const user = req.user;

		if (user.role === 'SUPER_ADMIN') {
			return next();
		}

		if (!resourceType || !resourceId) {
			return next(new AppError({
				message: 'Resource type and ID are required',
				statusCode: 400,
			}));
		}

		const hasAccess = await hasPermission(user.userId, resourceType, resourceId, requiredPermission);

		if (!hasAccess) {
			return next(new AppError({
				message: `You do not have ${requiredPermission} access to this ${resourceType.toLowerCase()}`,
				statusCode: 403,
			}));
		}

		return next();
	};
};

const checkAclEntryResources = async (req: Request, _: Response, next: NextFunction) => {
	try {
		const { resourceType, folderId, fileId } = req.body;

		// Skip check for super admins
		if (req.user.role === 'SUPER_ADMIN') {
			return next();
		}

		// Check if the resource exists based on resourceType
		if (resourceType === ResourceType.FOLDER && folderId) {
			const folder = await prisma.folder.findUnique({
				where: { id: folderId },
				select: { id: true, accountId: true }
			});

			if (!folder) {
				return next(
					new AppError({
						message: 'Folder not found',
						statusCode: 404,
					})
				);
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
		} else if (resourceType === ResourceType.FILE && fileId) {
			const file = await prisma.file.findUnique({
				where: { id: fileId },
				select: { id: true, accountId: true }
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
						message: 'You do not have permission to manage access for this file',
						statusCode: 403,
					})
				);
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
