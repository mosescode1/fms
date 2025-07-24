import { Request, Response } from "express";
import fileServiceInstance from "../../../service/v2/files/drive.service";
import { AppError } from "../../../lib";
import { getPaginationParams, createPaginatedResponse } from "../../../lib/pagination";
import trashService from '../../../service/v1/trash/trash.service';
import auditLogService from '../../../service/v1/auditLog/audit_log.service';
// import auditLogService from '../../../service/v1/auditLog/audit_log.service';

class FileController{

    async createFolder(req: Request, res: Response){
        // get folder and parent folder from the request body

        if (!req.body) {
            throw new AppError({message: "Request Body Missing", statusCode: 400});
        }
        const { folderName} = req.body;
        if (folderName === undefined || folderName === null || folderName === "") {
            throw new AppError({message: "Folder name is required", statusCode: 400});
        }
        const parentId = req.params.resourceId ? req.params.resourceId : undefined;




        // create the folder in the database
        const folderData = {
            folderName: folderName,
            parentId: parentId,
            userId: req.user.userId,
        };

        const folder = await fileServiceInstance.createFolder(folderData);

        res.status(200).json({
            status: "success",
            message: "Folder created successfully",
            data: {
                folder
            }
        });
    }


    async uploadFile(req: Request, res: Response){
        if (!req.files || !req.file) {
            return res.status(400).json({ error: 'No file uploaded Missing File to upload' });
        }

        // arrays of
        const { buffer, originalname, mimetype, size, encoding } = req.file;

        // TODO: get the remote path from the request body
        let remotePath = '/';

        // TODO: create the file in the google by clling drive service
        const fileData = {
            name: originalname,
            mimetype,
            size,
            encoding,
            folderId: req.params.resourceId,
            remotePath,
            localSource: buffer,
            userId: req.user.userId,
        };

        const data = await fileServiceInstance.uploadFile(fileData);

        res.status(200).json({
            message: 'File uploaded to remote server directly from memory',
            file: data
        });
    }
    
    
    async uploadFiles(req: Request, res: Response) {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            return res.status(400).json({ error: 'No files uploaded. Missing files to upload' });
        }
        
        // Get the remote path from the request body, default to root if not provided
        const remotePath = req.body.remotePath || '/';
        
        // Map through the files and prepare them for upload returning an array of promises
        const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
            const { buffer, originalname, mimetype, size, encoding } = file;
            
            const fileData = {
                name: originalname,
                mimetype,
                size,
                encoding,
                folderId: req.params.resourceId,
                remotePath,
                localSource: buffer,
                userId: req.user.userId,
            };
            
            return fileServiceInstance.uploadFile(fileData);
        });
        
        try {
            // Wait for all uploads to complete
            const uploadedFiles = await Promise.all(uploadPromises);
            
            res.status(200).json({
                message: 'Files uploaded to remote server directly from memory',
                files: uploadedFiles
            });
        } catch (error:any) {
            res.status(500).json({
                error: 'Failed to upload one or more files',
                details: error.message
            });
        }
    }

    async uploadFolder(req: Request, res: Response){
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        if (!req.body.folderStructure) {
            return res.status(400).json({ 
                error: 'Folder structure information is required',
                example: {
                    "file1.txt": { "path": "/folder1", "name": "file1.txt" },
                    "folder1/file2.txt": { "path": "/folder1", "name": "file2.txt" },
                    "folder1/subfolder/file3.txt": { "path": "/folder1/subfolder", "name": "file3.txt" }
                }
            });
        }

        let folderStructure;
        try {
            folderStructure = JSON.parse(req.body.folderStructure);
        } catch (error) {
            return res.status(400).json({ 
                error: 'Invalid folder structure format. Must be a valid JSON string.',
                example: {
                    "file1.txt": { "path": "/folder1", "name": "file1.txt" },
                    "folder1/file2.txt": { "path": "/folder1", "name": "file2.txt" },
                    "folder1/subfolder/file3.txt": { "path": "/folder1/subfolder", "name": "file3.txt" }
                }
            });
        }

        // Validate folder structure format
        if (typeof folderStructure !== 'object') {
            return res.status(400).json({ 
                error: 'Folder structure must be an object mapping file paths to their metadata',
                example: {
                    "file1.txt": { "path": "/folder1", "name": "file1.txt" },
                    "folder1/file2.txt": { "path": "/folder1", "name": "file2.txt" },
                    "folder1/subfolder/file3.txt": { "path": "/folder1/subfolder", "name": "file3.txt" }
                }
            });
        }

        const parentId = req.params.resourceId;
        const userId = req.user.userId;

        // Process the folder structure and files
        try {
            const result = await fileServiceInstance.uploadFolder({
                files: req.files,
                folderStructure,
                parentId,
                userId
            });

            res.status(200).json({
                message: 'Folder uploaded successfully',
                data: result
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                error: error.message || 'Failed to upload folder'
            });
        }
    }
    
    async  uploadFolders(req: Request, res: Response) {
        // Check if files are uploaded
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({
                error: 'No files uploaded',
                details: 'Please provide files under the "files" field in multipart/form-data'
            });
        }
        
        // Check if folderStructure is provided
        if (!req.body.folderStructure) {
            return res.status(400).json({
                error: 'Folder structure information is required',
                example: {
                    'file1.txt': { path: '/folder1', name: 'file1.txt' },
                    'folder1/file2.txt': { path: '/folder1', name: 'file2.txt' },
                    'folder1/subfolder/file3.txt': { path: '/folder1/subfolder', name: 'file3.txt' }
                }
            });
        }
        
        // Parse folderStructure
        let folderStructure: { [key: string]: { path: string; name: string } };
        try {
            folderStructure = JSON.parse(req.body.folderStructure);
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid folder structure format. Must be a valid JSON string.',
                example: {
                    'file1.txt': { path: '/folder1', name: 'file1.txt' },
                    'folder1/file2.txt': { path: '/folder1', name: 'file2.txt' },
                    'folder1/subfolder/file3.txt': { path: '/folder1/subfolder', name: 'file3.txt' }
                }
            });
        }
        
        // Validate folder structure format
        if (typeof folderStructure !== 'object' || folderStructure === null) {
            return res.status(400).json({
                error: 'Folder structure must be an object mapping file paths to their metadata',
                example: {
                    'file1.txt': { path: '/folder1', name: 'file1.txt' },
                    'folder1/file2.txt': { path: '/folder1', name: 'file2.txt' },
                    'folder1/subfolder/file3.txt': { path: '/folder1/subfolder', name: 'file3.txt' }
                }
            });
        }
        
        // Validate that all uploaded files have corresponding folderStructure entries
        const fileNames = (req.files as Express.Multer.File[]).map(file => file.originalname);
        const structureKeys = Object.keys(folderStructure);
        const missingFiles = fileNames.filter(name => !structureKeys.some(key => key === name || folderStructure[key].name === name));
        const extraStructureFiles = structureKeys.filter(key => !fileNames.includes(key) && !fileNames.includes(folderStructure[key].name));
        
        if (missingFiles.length > 0 || extraStructureFiles.length > 0) {
            return res.status(400).json({
                error: 'Mismatch between uploaded files and folder structure',
                details: {
                    missingFiles: missingFiles.length > 0 ? missingFiles : undefined,
                    extraStructureFiles: extraStructureFiles.length > 0 ? extraStructureFiles : undefined
                }
            });
        }
        
        const parentId = req.params.resourceId;
        const userId = req.user.userId;
        
        // Process the folder structure and files
        try {
            const result = await fileServiceInstance.uploadFolder({
                files: req.files as Express.Multer.File[], // Pass raw Multer files
                folderStructure,
                parentId,
                userId
            });
            
            res.status(200).json({
                message: `Successfully uploaded ${result.files.length} file(s) in folder structure`,
                data: result
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                error: error.message || 'Failed to upload folder',
                details: error.message
            });
        }
    }
    
    async allFiles(req: Request, res: Response){
        const { page, limit, skip } = getPaginationParams(req);
        const { files, total } = await fileServiceInstance.allFiles(skip, limit);

        const paginatedResponse = createPaginatedResponse(files, total, { page, limit, skip });

        res.status(200).json({
            status: "success",
            ...paginatedResponse
        });
    }


    async allFolders(req: Request, res: Response){
        const { page, limit, skip } = getPaginationParams(req);
        const { folders, total } = await fileServiceInstance.allFolders(skip, limit);

        const paginatedResponse = createPaginatedResponse(folders, total, { page, limit, skip });

        res.status(200).json({
            status: "success",
            ...paginatedResponse
        });
    }


    async getFolderById(req: Request, res: Response){
        const data = await fileServiceInstance.getFolderById(req.params.resourceId);
        if (!data){
            throw new AppError({message: "Folder not Found", statusCode: 404})
        }
        res.status(200).json({
            data
        })
    }

    // async getRootFolderPermissionLevel(req: Request, res: Response){
    //     const folderPath = req.user.permissionLevel ?? [];
    //     if (!req.user.permissionLevel) {
    //         throw new AppError({ message: 'Permission level not set on user', statusCode: 404 });
    //     }
    //
    //     const folders = await fileServiceInstance.getRootFolderPermissionLevel(folderPath);
    //
    //     if (!folders) {
    //         throw new AppError({ message: 'No folders found for the given path', statusCode: 404 });
    //     }
    //
    //     // remove null values from the folders array
    //     const filteredFolders = folders.filter(folder => folder !== null);
    //
    //     res.status(200).json({
    //         status: "success",
    //         data:{
    //             folders: filteredFolders
    //         }
    //     })
    // }

    async userDeleteFolder(req: Request, res: Response){
        const folderPath = req.params.folderPath;
        const accountId = req.user.userId;
        const folderId = req.params.resourceId;

        // check if the folder exists
        const existingFolder = await fileServiceInstance.getFolderById(folderId);
        if (!existingFolder) {
            throw new AppError({ message: 'Folder not found', statusCode: 404 });
        }

        console.log(existingFolder)
        const folderData = {
            folderPath,
            accountId,
            folderId,
            originalPath: existingFolder.fullPath,
        }

        // mark as delete in the database and not fully delete it
        const folder = await fileServiceInstance.userDeleteFolder(folderData);

        // add it to the trash folder
        await trashService.createTrashFolder(folderData);

        // add it to the audit log
        const auditLogData = {
            action: "DELETE",
            targetId: folder.id,
            actorId: accountId,
            targetType: "FOLDER",
            folderId: folder.id,
        }
        await auditLogService.createAuditLog(auditLogData);

        res.status(200).json({
            status: "success",
            message: "Folder deleted successfully"
        });
    }

	async accessFiles(req:Request, res:Response) {
        console.log("accessing files controller");
        const userId = req.user.userId;
        const { page, limit, skip } = getPaginationParams(req);
        const { items, total } = await fileServiceInstance.accessFiles(userId, skip, limit);

        const paginatedResponse = createPaginatedResponse(items, total, { page, limit, skip });

        res.status(200).json({
            status: "success",
            ...paginatedResponse
        });
	}

    async getFileById(req: Request, res: Response) {
        const resourceId = req.params.resourceId;

        if (!resourceId) {
            throw new AppError({message: "File ID is required", statusCode: 400});
        }

        const file = await fileServiceInstance.getFileById(resourceId);
        console.log(file)

        if (!file) {
            throw new AppError({message: "File not found", statusCode: 404});
        }

        res.status(200).json({
            status: "success",
            data: {
                file
            }
        });
    }

    async userDeleteFile(req: Request, res: Response) {
        const filePath = req.params.filePath;
        const accountId = req.user.userId;
        const fileId = req.params.resourceId;

        // check if the file exists
        const existingFile = await fileServiceInstance.getFileById(fileId);
        if (!existingFile) {
            throw new AppError({ message: 'File not found', statusCode: 404 });
        }

        const fileData = {
            filePath,
            accountId,
            fileId,
            originalPath: existingFile.filePath,
        }

        // mark as delete in the database and not fully delete it
        const file = await fileServiceInstance.userDeleteFile(fileData);

        // add it to the trash folder
        await trashService.createTrashFile(fileData);

        // add it to the audit log
        const auditLogData = {
            action: "DELETE",
            targetId: file.id,
            actorId: accountId,
            targetType: "FILE",
            fileId: file.id,
        }
        await auditLogService.createAuditLog(auditLogData);

        res.status(200).json({
            status: "success",
            message: "File deleted successfully"
        });
    }
}

const fileController = new FileController();
export default fileController;
