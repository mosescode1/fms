"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env' });
const Config = {
    db: {
        url: process.env.NODE_ENV === 'development'
            ? ''
            : process.env.DATABASE_URL || '',
    },
    redis: {
        url: process.env.NODE_ENV === 'development'
            ? 'redis://localhost:6379'
            : process.env.REDIS_URL || '',
    },
    jwt: {
        accessSecretToken: process.env.NODE_ENV === 'development'
            ? 'Jesusmystrongtowerandmypersonalsavior'
            : process.env.SECRET_KEY_JWT || '',
        refreshSecretToken: process.env.NODE_ENV === 'development'
            ? 'Jesusismylife2024'
            : process.env.REFRESH_SECRET_KEY_JWT || '',
        expiry: process.env.NODE_ENV === 'development'
            ? '1h'
            : process.env.SECRET_KEY_JWT_EXPIRES || '1h',
        refreshExpiry: process.env.NODE_ENV === 'development'
            ? '1d'
            : process.env.REFRESH_SECRET_KEY_JWT_EXPIRES || '1d',
    },
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
};
exports.default = Config;
//# sourceMappingURL=index.js.map