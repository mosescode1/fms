"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticate = void 0;
const lib_1 = require("../lib");
const jwt_1 = require("../lib/jwt");
const Authenticate = (req, _, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        throw new lib_1.AppError({ message: "Missing Authorization Header", statusCode: 401 });
    }
    const token = req.headers.authorization.split(" ", 2)[1];
    if (!token) {
        throw new lib_1.AppError({ message: "Missing Authorization Token", statusCode: 401 });
    }
    try {
        const decoded = jwt_1.JwtFeature.verifyToken(token);
        if (typeof decoded !== "string") {
            req.user = {
                userId: decoded.id,
            };
        }
        next();
    }
    catch (error) {
        throw new lib_1.AppError({ message: error.message, statusCode: 403 });
    }
};
exports.Authenticate = Authenticate;
//# sourceMappingURL=authenticate.js.map