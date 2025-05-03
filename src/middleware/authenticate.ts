import {AppError} from "../lib";
import {JwtFeature} from "../lib/jwt";
import {Request, Response, NextFunction} from "express";
import userRepo from "../repository/user/user.repo";


const Authenticate = async (req:Request, _:Response, next:NextFunction) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        throw new AppError({message:"Missing Authorization Header", statusCode: 401});
    }
    const token = req.headers.authorization.split(" ", 2)[1];
    if (!token) {
        throw new AppError({message:"Missing Authorization Token", statusCode: 401});
    }
    // VERIFY TOKEN: verify token
    try {
        const decoded = JwtFeature.verifyToken(token);
        if (typeof decoded === "string") {
            throw new AppError({message: decoded, statusCode: 403});
        }


        
        //TODO: check if user is a member or a user and validate the token
        // check for user with the id

        const user = await userRepo.findUserById(decoded.id);
        if (user && decoded.id !== user.id) {
            throw new AppError({message:"Invalid Token", statusCode: 401})
        }

        if (user && decoded.role !== user.role){
            throw new AppError({message: "Invalid Role", statusCode:401})
        }

        req.user = {
            userId: decoded.id,
            role: decoded.role
        }

        // check if user exists
        // const member = await memberRepo.getMemberById(req.user.userId);
        if (!user) {
            throw new AppError({message: "User with this Account doesn't exists", statusCode: 404});
        }


        next();
    } catch (error: any) {
        throw new AppError({message: error.message, statusCode: 403});
    }
}

export {Authenticate}