"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reqValidator = (req, requiredFields) => {
    if (!req.body) {
        return {
            status: false,
            message: "Request body is required",
        };
    }
    for (const key in requiredFields) {
        const value = requiredFields[key];
        if (req.body[value] === undefined || req.body[key] === null || req.body[value] === "") {
            return {
                status: false,
                message: `${value} field is required or the field is empty`,
            };
        }
    }
    return {
        status: true,
        message: "All required fields are present",
    };
};
exports.default = reqValidator;
//# sourceMappingURL=reqValidator.js.map