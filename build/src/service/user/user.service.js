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
class UserService {
    userProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_repo_1.default.findUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        });
    }
}
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map