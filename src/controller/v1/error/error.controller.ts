
import { Response, ErrorRequestHandler } from 'express';
import {AppError} from "../../../lib";
import Config from "../../../config";

const errProd = (err: any, res: Response) => {
    // Operational errors we want to display to the client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Log the error (can be sent to a monitoring service here)
        console.error('ERROR 💥:', err);
        // Send a generic error message to the client
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};

const errDev = (err: any, res: Response) => {
    console.log(err);
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const prismaClientValidationError = () => {
    return new AppError({ message: 'Invalid data format or missing required fields', statusCode: 400 });
};

const prismaClientKnownRequestError = (err: any) => {
    // Handle specific Prisma error codes
    if (err.code === 'P2002') {
        return new AppError({ 
            message: `Unique constraint violation on field: ${err.meta?.target?.join(', ')}`, 
            statusCode: 409 
        });
    }
    if (err.code === 'P2025') {
        return new AppError({ 
            message: 'Record not found', 
            statusCode: 404 
        });
    }
    return new AppError({ 
        message: 'Database operation failed', 
        statusCode: 500 
    });
};

const handleJsonWebTokenError = () => {
    return new AppError({
        message: 'Invalid authentication token',
        statusCode: 401,
    });
};

const handleTokenExpiredError = () => {
    return new AppError({
        message: 'Your authentication token has expired. Please log in again',
        statusCode: 401,
    });
};

const handleTimeoutError = () => {
    return new AppError({
        message: 'Request timed out. Please try again later',
        statusCode: 408,
    });
};

export const globalError: ErrorRequestHandler = (err, _, res, next ) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (res.headersSent) {
        return next(err);
    }

    if (Config.environment === 'development') {
        errDev(err, res);
    } else if (Config.environment === 'production') {
        // Create a copy of the error object to handle properties safely
        let error: any = { ...err };
        error.message = err.message || 'An unknown error occurred';

        // JWT errors
        if (err.name === 'jwt malformed' || err.name === 'JsonWebTokenError') {
            error = handleJsonWebTokenError();
        } else if (err.name === 'TokenExpiredError') {
            error = handleTokenExpiredError();
        } 
        // Prisma errors
        else if (err.name === 'PrismaClientValidationError') {
            error = prismaClientValidationError();
        } else if (err.name === 'PrismaClientKnownRequestError') {
            error = prismaClientKnownRequestError(err);
        } 
        // Timeout errors
        else if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
            error = handleTimeoutError();
        }
        // Google Drive API errors
        else if (err.message.includes('invalid_grant')) {
            error = new AppError({
                message: 'Google Drive API token has expired. Please update the token.',
                statusCode: 401
            });
        }

        errProd(error, res);
    }
};
