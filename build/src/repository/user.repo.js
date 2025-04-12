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
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = require("../prisma/prisma.client");
class UserRepository {
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.prisma.users.create({
                    data,
                });
            }
            catch (err) {
                console.log("user repo");
                throw new Error(err.message);
            }
        });
    }
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.prisma.users.update({
                    where: {
                        id,
                    },
                    data,
                });
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.prisma.users.delete({
                    where: {
                        id,
                    },
                });
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.prisma.users.findUnique({
                    where: {
                        id,
                    },
                });
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma_client_1.prisma.users.findUnique({
                    where: {
                        email,
                    },
                });
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
}
const UserRepo = new UserRepository();
exports.default = UserRepo;
//# sourceMappingURL=user.repo.js.map