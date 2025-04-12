import jwt from 'jsonwebtoken';
import {AppError} from "./error";
import Config from "../config";


class JwtFeature {
    static  signToken = (payload: object) => {
        if (!Config.jwt.accessSecretToken) throw new AppError({message:"Missing Access SecretToken", statusCode: 401});
        return jwt.sign( payload , Config.jwt.accessSecretToken, {
            expiresIn: Config.jwt.expiry as any,
        });
    };

    static verifyToken = (token: string) => {
        if (!Config.jwt.accessSecretToken) throw new AppError({message:"Missing Access SecretToken", statusCode: 401});
        return jwt.verify(token, Config.jwt.accessSecretToken);
    };

    static refreshToken = (id: string) => {
        if (!Config.jwt.refreshSecretToken) throw new AppError({message:"Missing Access SecretToken", statusCode: 401});
        return jwt.sign({ id }, Config.jwt.refreshSecretToken, {
            expiresIn: Config.jwt.refreshExpiry as any,
        });
    };

    static verifyRefreshToken = (token: string) => {
        try {
            return jwt.verify(token, Config.jwt.refreshSecretToken);
        } catch (err: any) {
            return new AppError({ message: err.message, statusCode: 404 });
        }
    };
}

export {
  JwtFeature
};