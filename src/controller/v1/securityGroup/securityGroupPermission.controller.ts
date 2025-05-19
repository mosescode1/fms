import { Response, Request, NextFunction } from 'express';
import { AppError } from '../../../lib';
import permissionService from '../../../service/v1/permission/permission.service';
import securityService from '../../../service/v1/securityGroup/security.service';
import { Permissions, ResourceType } from '@prisma/client';

class SecurityGroupPermissionController {
    giveSecurityGroupPermissions = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { 
                resourceType, 
                permissions, 
                folderId, 
                fileId, 
                inherited = false 
            } = req.body;

            // Validate required fields
            if (!id) {
                throw new AppError({ message: 'Security Group ID is required', statusCode: 400 });
            }

            if (!resourceType || !permissions || permissions.length === 0) {
                throw new AppError({ message: 'Resource type and permissions are required', statusCode: 400 });
            }

            // Validate that either folderId or fileId is provided based on resourceType
            if (resourceType === ResourceType.FOLDER && !folderId) {
                throw new AppError({ message: 'Folder ID is required for folder permissions', statusCode: 400 });
            }

            if (resourceType === ResourceType.FILE && !fileId) {
                throw new AppError({ message: 'File ID is required for file permissions', statusCode: 400 });
            }

            // Check if a security group exists
            const securityGroups = await securityService.allSecurityGroups();
            const securityGroup = securityGroups.find(group => group.id === id);
            if (!securityGroup) {
                throw new AppError({ message: 'Security Group not found', statusCode: 404 });
            }

            // Create permission data
            const permissionData = {
                resourceType: resourceType as ResourceType,
                permissions: permissions as Permissions[],
                inherited,
                folderId,
                fileId,
                groupId: id
            };

            // Use the permission service to create the permission
            const permission = await permissionService.createPermission(permissionData);

            res.status(201).json({
                status: 'success',
                message: 'Permission assigned successfully to security group',
                data: {
                    permission
                }
            });
        } catch (error: any) {
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new AppError({ message: error.message, statusCode: 500 });
            }
        }
    }

    /**
     * @desc Get all security groups
     * @route GET /api/v1/security-group
     * @access only admin and super_admin
     */
    async getAllSecurityGroups(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {}
    /**
     * @desc Get all security groups
     * @route GET /api/v1/security-group
     * @access only admin and super_admin
     */
    async createSecurityGroup(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {}

    /**
     *
     * @desc Add users to the security group
     * @param req
     * @param res
     * @param next
     */
    async addUserToGroup(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {}

    /**
     * @desc Edit a security group
     * @param req
     * @param res
     * @param next
     */
    async editSecurityGroup(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {}

    /**
     * @desc Delete a security group
     * @param req
     * @param res
     * @param next
     */
    async deleteSecurityGroup(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {}
}

const securityGroupPermissionController = new SecurityGroupPermissionController();
export default securityGroupPermissionController;