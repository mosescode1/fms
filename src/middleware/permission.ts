import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib";

const checkPermission = (...roles: string[]) => {
    return (req: Request, _: Response, next: NextFunction) => {
        if (!roles.includes(req.user.loggedInAs)) {
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

module.exports = {
    checkPermission,
};
