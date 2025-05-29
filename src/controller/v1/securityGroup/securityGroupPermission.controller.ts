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

            if (!resourceType || !permissions) {
                throw new AppError({message: 'Resource type and permissions are required', statusCode: 400});
            } else if (permissions.length === 0) {
                throw new AppError({message: 'Resource type and permissions are required', statusCode: 400});
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
    ): Promise<any> {
        const securityGroups = await securityService.allSecurityGroups();

        res.status(200).json({
          "status": "success",
            "data": {
                "securityGroups": securityGroups
            }
        })
    }
    /**
     * @desc Get all security groups
     * @route GET /api/v1/security-group
     * @access only admin and super_admin
     */
    async createSecurityGroup(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        if (typeof req.body !== 'object'){
           return res.status(400).json({
                status: 'fail',
                message: 'Invalid request body'
            })
        }

        const { name, description } = req.body;

        // Validate required fields
        if (!name || !description) {
            throw new AppError({ message: 'Name, description and ACLs are required', statusCode: 400 });
        }

        const data = {
            name,
            description
        }
        // Create a security group
        const securityGroup = await securityService.createSecurityGroup(data);

        res.status(201).json({
            status: 'success',
            message: 'Security group created successfully',
            data: {
                securityGroup
            }
        });
    }

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
    ): Promise<any> {
        if (typeof req.body !== 'object'){
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid request body'
            })
        }

        if (!req.body){
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid request body'
            })
        }

        const { userIds } = req.body;
        const { groupId } = req.params;

        if (!userIds || !groupId){
            return res.status(400).json({
                status: 'fail',
                message: 'Missing userIds or groupId from the parameter'
            })
        }
        // Validate required fields
        if (userIds.length < 0) {
            throw new AppError({ message: 'User ID and Group ID are required', statusCode: 400 });
        }

        const data = {
            userIds,
            securityGroupId: groupId
        }
        // Add a user to the security group
        const user = await securityService.addUsersToSecurityGroups(data);

        res.status(201).json({
            status: 'success',
            message: 'User added to security group successfully',
            data: {
                user
            }
        });
    }

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
    ): Promise<any> {
        if (typeof req.body !== 'object'){
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid request body'
            })
        }

        const { groupId } = req.params;
        const { name, description } = req.body;

        if (!groupId){
            return res.status(400).json({
                status: 'fail',
                message: 'Missing groupId from the parameter'
            })
        }

        // Validate required fields
        if (!name && !description) {
            throw new AppError({ message: 'name or description are required', statusCode: 400 });
        }

        const data = {
            name,
            description
        }
        // Edit a security group
        const securityGroup = await securityService.editSecurityGroup(groupId, data);

        res.status(200).json({
            status: 'success',
            message: 'Security group updated successfully',
            data: {
                securityGroup
            }
        });
    }

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
    ): Promise<any> {
        const { groupId } = req.params;

        if (!groupId){
            return res.status(400).json({
                status: 'fail',
                message: 'Missing groupId from the parameter'
            })
        }

        // Delete a security group
        const securityGroup = await securityService.deleteSecurityGroup(groupId);

        res.status(200).json({
            status: 'success',
            message: 'Security group deleted successfully',
            data: {
                securityGroup
            }
        });
    }
}

const securityGroupPermissionController = new SecurityGroupPermissionController();
export default securityGroupPermissionController;