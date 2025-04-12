"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../../controller/user/user.controller"));
const authenticate_1 = require("../../middleware/authenticate");
const router = (0, express_1.default)();
router.get("/me", authenticate_1.Authenticate, user_controller_1.default.userProfile);
exports.default = router;
//# sourceMappingURL=user.routes.js.map