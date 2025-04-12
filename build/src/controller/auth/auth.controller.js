"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../../service/auth/auth.service"));
const lib_1 = require("../../lib");
const reqValidator_1 = __importDefault(require("../../lib/reqValidator"));
class AuthController {
    constructor() { }
    /**
    * Validate email format using regex
    * @param email - The email address to validate
    * @return boolean - Returns true if the email format is valid, false otherwise
    * */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Validate password format using regex
     * @param password - The password to validate
     * @return boolean - Returns true if the password format is valid, false otherwise
     * */
    static validatePassword(password) {
        // Password must be at least 8 characters long and contain at least one number
        const passwordRegex = /^(?=.*[0-9]).{8,}$/;
        return passwordRegex.test(password);
    }
    /**
     * Register a new user
     * @param req - The request object
     * @param res - The response object
     * @param next - The next function
     * @return user object and token
     * */
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const required = (0, reqValidator_1.default)(req, ["fullName", "phoneNumber", "email", "password"]);
            if (!required.status) {
                throw new lib_1.AppError({ message: required.message, statusCode: 400 });
            }
            if (!AuthController.validateEmail(req.body.email)) {
                throw new lib_1.AppError({ message: "Invalid email address", statusCode: 400 });
            }
            if (!AuthController.validatePassword(req.body.password)) {
                throw new lib_1.AppError({ message: "Password must be at least 8 characters long and contain at least one number", statusCode: 400 });
            }
            // Check if user already exists
            const existingUser = yield auth_service_1.default.findUserByEmail(req.body.email);
            if (existingUser) {
                throw new lib_1.AppError({ message: `User with this ${existingUser.email} already exists`, statusCode: 409 });
            }
            // Hash password
            let hashedPassword;
            try {
                hashedPassword = yield auth_service_1.default.createHashPassword(req.body.password);
            }
            catch (err) {
                throw new lib_1.AppError({ message: err.message, statusCode: 500 });
            }
            // Create user
            const user = {
                fullName: req.body.fullName,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                password: hashedPassword,
            };
            try {
                yield auth_service_1.default.createUser(user);
            }
            catch (err) {
                throw new lib_1.AppError({ message: err.message, statusCode: 500 });
            }
            res.status(201).json({ message: "Registration successful" });
        });
    }
    /**
     * Login a user
     * @param req - The request object
     * @param res - The response object
     * @param next - The next function
     * @return user object and token
     * */
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const required = (0, reqValidator_1.default)(req, ["email", "password"]);
            if (!required.status) {
                throw new lib_1.AppError({ message: required.message, statusCode: 400 });
            }
            const email = req.body.email;
            const password = req.body.password;
            if (!AuthController.validateEmail(email)) {
                throw new lib_1.AppError({ message: "Invalid email format", statusCode: 422 });
            }
            if (!AuthController.validatePassword(req.body.password)) {
                throw new lib_1.AppError({ message: "Password must be at least 8 characters long and contain at least one number", statusCode: 422 });
            }
            const user = yield auth_service_1.default.findUserByEmail(email);
            if (!user) {
                throw new lib_1.AppError({ message: "Invalid email or password", statusCode: 401 });
            }
            const isPasswordValid = yield auth_service_1.default.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                throw new lib_1.AppError({ message: "Invalid email or password", statusCode: 401 });
            }
            // Generate JWT token
            const token = yield auth_service_1.default.generateToken({ id: user.id });
            // Set token in response header
            res.setHeader("Authorization", `Bearer ${token}`);
            // Set token in cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600000, // 1 hour
            });
            // Send response
            user.password = undefined;
            res.status(200).json({
                data: {
                    user,
                    token,
                },
                message: "Login successful"
            });
        });
    }
    /**
     * Logout a user
     * @param req - The request object
     * @param res - The response object
     * @param next - The next function
     * @return success message
     * */
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement logout logic here
            res.status(200).json({ message: "Logout successful" });
        });
    }
}
const AuthControllerInstance = new AuthController();
exports.default = AuthControllerInstance;
//# sourceMappingURL=auth.controller.js.map