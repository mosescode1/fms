"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/authRoutes/auth.routes"));
const error_controller_1 = require("./controller/error/error.controller");
const lib_1 = require("./lib");
const user_routes_1 = __importDefault(require("./routes/userRoutes/user.routes"));
const organization_routes_1 = __importDefault(require("./routes/organizationRoutes/organization.routes"));
const app = (0, express_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 100,
    message: "Exceeded Rate Limit Try Again After 1 minute",
});
// Middlewares
app.set('trust proxy', 1);
app.use((0, morgan_1.default)("common"));
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(limiter);
// Routes
app.get("/api/v1/health", (_, res) => {
    res.status(200).json({ status: "UP" });
});
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/user", user_routes_1.default);
app.use("/api/v1/organization", organization_routes_1.default);
// app.use("/api/v1/files")
// Unhandled routes
app.use('/*splat', (req, _, next) => {
    next(new lib_1.AppError({
        message: `Route Not Found ${req.originalUrl}`,
        statusCode: 404,
    }));
});
// Error handling middleware
app.use(error_controller_1.globalError);
exports.default = app;
//# sourceMappingURL=app.js.map