import { Request, Response } from "express";
import fileServiceInstance from "../../service/file/file.service";
import { AppError } from "../../lib";

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
        console.log(data)

        res.status(200).json({
            data
        })
    }
}

const fileController = new FileController();
export default fileController;