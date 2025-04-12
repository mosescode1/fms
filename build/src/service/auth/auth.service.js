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
const user_repo_1 = __importDefault(require("../../repository/user.repo"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../../lib/jwt");
const lib_1 = require("../../lib");
class AuthService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    createHashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salt = yield bcrypt_1.default.genSalt(10);
                return yield bcrypt_1.default.hash(password, salt);
            }
            catch (error) {
                throw new Error("Error hashing password");
            }
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepo.findUserByEmail(email);
        });
    }
    generateToken(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return jwt_1.JwtFeature.signToken({ userId: payload });
            }
            catch (err) {
                throw new lib_1.AppError({ message: err.message, statusCode: 500 });
            }
        });
    }
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.userRepo.createUser(data);
            }
            catch (error) {
                throw new Error("Error creating user");
            }
        });
    }
    verifyPassword(userPassword, hashPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(userPassword, hashPassword);
        });
    }
}
const authService = new AuthService(user_repo_1.default);
exports.default = authService;
//# sourceMappingURL=auth.service.js.map