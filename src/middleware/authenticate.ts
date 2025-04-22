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

        if (typeof decoded !== "string") {
            req.user ={
                userId: decoded.id,
                loggedInAs: decoded.loggedInAs,
            }
        }
        
        //TODO: check if user is a member or a user and validate the token
        // check for user with the id

        const user = await userRepo.findUserById(req.user.userId);
        // check if member exists
        // const member = await memberRepo.getMemberById(req.user.userId);
        if (!user) {
            throw new AppError({message: "User with this token no longer exists", statusCode: 404});
        }
        next();
    } catch (error: any) {
        throw new AppError({message: error.message, statusCode: 403});
    }
}

export {Authenticate}