import {AppError} from "../lib";
import {JwtFeature} from "../lib/jwt";
import {Request, Response, NextFunction} from "express";


const Authenticate = (req:Request, _:Response, next:NextFunction) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        throw new AppError({message:"Missing Authorization Header", statusCode: 401});
    }
    const token = req.headers.authorization.split(" ", 2)[1];
    if (!token) {
        throw new AppError({message:"Missing Authorization Token", statusCode: 401});
    }

    try {
        const decoded = JwtFeature.verifyToken(token);

        if (typeof decoded !== "string") {
            req.user ={
                userId: decoded.id,
            }
        }

        next();
    } catch (error: any) {
        throw new AppError({message: error.message, statusCode: 403});
    }
}

export {Authenticate}