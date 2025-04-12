"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalError = void 0;
const lib_1 = require("../../lib");
const config_1 = __importDefault(require("../../config"));
const errProd = (err, res) => {
    // Operational errors we want to display to the client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        // Log the error (can be sent to a monitoring service here)
        console.error('ERROR 💥:', err);
        // Send a generic error message to the client
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};
const errDev = (err, res) => {
    console.log(err);
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const prismaClientValidationError = () => {
    return new lib_1.AppError({ message: 'Wrong Information passed', statusCode: 404 });
};
const handleJsonWebTokenError = () => {
    return new lib_1.AppError({
        message: 'Please provide a valid json token',
        statusCode: 401,
    });
};
const globalError = (err, _, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (res.headersSent) {
        return next(err);
    }
    if (config_1.default.environment === 'development') {
        errDev(err, res);
    }
    else if (config_1.default.environment === 'production') {
        console.log("here");
        // Create a copy of the error object to handle properties safely
        let error = Object.assign({}, err);
        error.message = err.message || 'An unknown error occurred';
        if (err.name === 'jwt malformed') {
            error = handleJsonWebTokenError();
        }
        if (err.name === 'JsonWebTokenError') {
            error = handleJsonWebTokenError();
        }
        if (err.name === 'TokenExpiredError') {
            error = handleJsonWebTokenError();
        }
        if (err.name === 'PrismaClientValidationError') {
            error = prismaClientValidationError();
        }
        errProd(error, res);
    }
};
exports.globalError = globalError;
//# sourceMappingURL=error.controller.js.map