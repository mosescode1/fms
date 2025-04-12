"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtFeature = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("./error");
const config_1 = __importDefault(require("../config"));
class JwtFeature {
}
exports.JwtFeature = JwtFeature;
JwtFeature.signToken = (payload) => {
    if (!config_1.default.jwt.accessSecretToken)
        throw new error_1.AppError({ message: "Missing Access SecretToken", statusCode: 401 });
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.accessSecretToken, {
        expiresIn: config_1.default.jwt.expiry,
    });
};
JwtFeature.verifyToken = (token) => {
    if (!config_1.default.jwt.accessSecretToken)
        throw new error_1.AppError({ message: "Missing Access SecretToken", statusCode: 401 });
    return jsonwebtoken_1.default.verify(token, config_1.default.jwt.accessSecretToken);
};
JwtFeature.refreshToken = (id) => {
    if (!config_1.default.jwt.refreshSecretToken)
        throw new error_1.AppError({ message: "Missing Access SecretToken", statusCode: 401 });
    return jsonwebtoken_1.default.sign({ id }, config_1.default.jwt.refreshSecretToken, {
        expiresIn: config_1.default.jwt.refreshExpiry,
    });
};
JwtFeature.verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.default.jwt.refreshSecretToken);
    }
    catch (err) {
        return new error_1.AppError({ message: err.message, statusCode: 404 });
    }
};
//# sourceMappingURL=jwt.js.map