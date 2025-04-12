import UserRepo from "../../repository/user.repo";
import bcrypt from "bcrypt";
import {Prisma} from "@prisma/client";
import {JwtFeature} from "../../lib/jwt";
import {AppError} from "../../lib";

class AuthService {

    constructor(private readonly userRepo: typeof UserRepo) {}

    async createHashPassword(password: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        }
        catch (error) {
            throw new Error("Error hashing password");
        }
    }

    async findUserByEmail(email: string) {
        return await this.userRepo.findUserByEmail(email);
    }


    async generateToken(payload: object): Promise<string> {
       try{
             return JwtFeature.signToken({userId: payload});
       }catch (err: any) {
                throw new AppError({message: err.message, statusCode: 500});
       }
    }

    async createUser(data: Prisma.UsersCreateInput) {
        try {
            return await this.userRepo.createUser(data);
        } catch (error) {
            throw new Error("Error creating user");
        }
    }

    async verifyPassword(userPassword:string, hashPassword:string) {
        return await bcrypt.compare(userPassword, hashPassword);
    }
}






const authService = new AuthService(UserRepo);

export default authService;