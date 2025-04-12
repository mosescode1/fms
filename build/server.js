"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./src/config"));
process.on("unhandledRejection", (err) => {
    console.error(`Received unHandled rejection at: ${err}`);
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    console.error(`Received uncaught exception at: ${err}`);
    process.exit(1);
});
process.on("SIGTERM", () => {
    console.log("shutting down gracefully");
    process.exit(0);
});
process.on("SIGINT", () => {
    console.log("shutting down gracefully");
    process.exit(0);
});
const app_1 = __importDefault(require("./src/app"));
const port = config_1.default.port;
app_1.default.listen(port, () => {
    console.log("Server started on port", port);
});
//# sourceMappingURL=server.js.map