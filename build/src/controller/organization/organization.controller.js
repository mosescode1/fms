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
const organization_service_1 = __importDefault(require("../../service/organization/organization.service"));
const lib_1 = require("../../lib");
const reqValidator_1 = __importDefault(require("../../lib/reqValidator"));
class OrganizationController {
    createOrganization(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const required = (0, reqValidator_1.default)(req, ["name", "email", "phoneNumber"]);
            if (!required.status) {
                throw new lib_1.AppError({ message: required.message, statusCode: 400 });
            }
            const organization = {
                name: req.body.name,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
            };
            try {
                yield organization_service_1.default.createOrganization(organization);
            }
            catch (err) {
                throw new lib_1.AppError({ message: err.message, statusCode: 500 });
            }
            res.status(201).json({ message: "Organization created successfully" });
        });
    }
}
const organizationController = new OrganizationController();
exports.default = organizationController;
//# sourceMappingURL=organization.controller.js.map