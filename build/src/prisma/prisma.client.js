"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const extension_accelerate_1 = require("@prisma/extension-accelerate");
const prisma = new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
}).$extends((0, extension_accelerate_1.withAccelerate)());
exports.prisma = prisma;
//# sourceMappingURL=prisma.client.js.map