import { Request, Response } from "express";
import fileServiceInstance from "../../service/file/file.service";
import { AppError } from "../../lib";
import trashService from '../../service/trash/trash.service';

class FileController{

    async createFolder(req: Request, res: Response){
        // get folder and parent folder from request body

        if (!req.body) {
            throw new AppError({message: "Request Body Missing", statusCode: 400});
        }
        const { folderName} = req.body;
        if (folderName === undefined || folderName === null || folderName === "") {
            throw new AppError({message: "Folder name is required", statusCode: 400});
        }
        const parentId = req.params.parentId ? req.params.parentId : undefined;




        // create the folder in the database
        const folderData = {
            folderName: folderName,
            parentId: parentId,
            userId: req.user.userId,
        };

        console.log("folderData", folderData)
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
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded Missing File to upload' });
        }

        // Log the file information
        console.log("file", req.file)


        const { buffer, originalname, mimetype, size, encoding } = req.file;

        // TODO: get the remote path from the request body
        let remotePath = '/';

        // TODO: create the file in the database
        const fileData = {
            name: originalname,
            mimetype,
            size,
            encoding,
            folderId: req.params.parentId,
            remotePath,
            localSource: buffer,
            userId: req.user.userId,
        };

        await fileServiceInstance.uploadFile(fileData);

        res.status(200).json({
            message: 'File uploaded to remote server directly from memory',
        });
    }

    async allFiles(req: Request, res: Response){
        const files = await fileServiceInstance.allFiles();
        res.status(200).json({
            status: "success",
            data: {
                files
            }
        });
    }


    async allFolders(req: Request, res: Response){
        const folders = await fileServiceInstance.allFolders();
        res.status(200).json({
            status: "success",
            data: {
                folders
            }
        });
    }


    async getFolderById(req: Request, res: Response){
        const data = await fileServiceInstance.getFolderById(req.params.folderId);
        res.status(200).json({
            data
        })
    }

    async getRootFolderPermissionLevel(req: Request, res: Response){
        const folderPath = req.user.permissionLevel ?? [];
        if (!req.user.permissionLevel) {
            throw new AppError({ message: 'Permission level not set on user', statusCode: 404 });
        }

        const folders = await fileServiceInstance.getRootFolderPermissionLevel(folderPath);

        if (!folders) {
            throw new AppError({ message: 'No folders found for the given path', statusCode: 404 });
        }

        // remove null values from the folders array
        const filteredFolders = folders.filter(folder => folder !== null);

        res.status(200).json({
            status: "success",
            data:{
                folders: filteredFolders
            }
        })
    }

    async userDeleteFolder(req: Request, res: Response){
        const folderPath = req.params.folderPath;
        const userId = req.user.userId;
        const folderId = req.params.folderId;
        const folderData = {
            folderPath,
            userId,
            folderId
        }

        // delete the folder in the database
        const folder = await fileServiceInstance.userDeleteFolder(folderData);

        // add it to the trash folder
        const trash = await trashService.createTrashFolder(folderData);
        res.status(200).json({
            status: "success",
            message: "Folder deleted successfully"
        });
    }
}

const fileController = new FileController();
export default fileController;