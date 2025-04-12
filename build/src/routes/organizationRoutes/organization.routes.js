"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const organization_controller_1 = __importDefault(require("../../controller/organization/organization.controller"));
const authenticate_1 = require("../../middleware/authenticate");
const router = (0, express_1.default)();
router.post("/", authenticate_1.Authenticate, organization_controller_1.default.createOrganization);
exports.default = router;
//# sourceMappingURL=organization.routes.js.map