import {NextFunction, Request, Response} from "express";
import AuthService from "../../service/auth/auth.service";
import {AppError} from "../../lib";
import reqValidator from "../../lib/reqValidator";



class AuthController {

    constructor() {}

    /**
    * Validate email format using regex
    * @param email - The email address to validate
    * @return boolean - Returns true if the email format is valid, false otherwise
    * */
    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password format using regex
     * @param password - The password to validate
     * @return boolean - Returns true if the password format is valid, false otherwise
     * */
    static validatePassword(password: string): boolean {
        // Password must be at least 8 characters long and contain at least one number
        const passwordRegex = /^(?=.*[0-9]).{8,}$/;
        return passwordRegex.test(password);
    }


    /**
     * Register a new user
     * @param req - The request object
     * @param res - The response object
     * @param next - The next function
     * @return user object and token
     * */
    async register(req: Request, res: Response, next:NextFunction) {
        const required = reqValidator(req, ["fullName","phoneNumber", "email", "password"]);

        if (!required.status) {
            throw new AppError({message: required.message, statusCode: 400});
        }

        if (!AuthController.validateEmail(req.body.email)) {
            throw new AppError({message: "Invalid email address", statusCode: 400});
        }

        if (!AuthController.validatePassword(req.body.password)) {
            throw new AppError({message: "Password must be at least 8 characters long and contain at least one number", statusCode: 400});
        }

        // Check if user already exists
        const existingUser = await AuthService.findUserByEmail(req.body.email);
        if (existingUser) {
            throw new AppError({message: `User with this ${existingUser.email} already exists`, statusCode: 409});
        }

        // Hash password
        let hashedPassword;
        try{
            hashedPassword = await AuthService.createHashPassword(req.body.password);
        }
        catch(err:any){
            throw new AppError({message: err.message, statusCode: 500});
        }

        // Create user
        const user = {
            fullName: req.body.fullName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            password: hashedPassword,
        };

        try{
            await AuthService.createUser(user);
        }catch (err: any){
            throw new AppError({message: err.message, statusCode: 500});
        }

        res.status(201).json({message: "Registration successful"});
    }

    /**
     * Login a user
     * @param req - The request object
     * @param res - The response object
     * @param next - The next function
     * @return user object and token
     * */
    async login(req: Request, res: Response, next:NextFunction) {
        const required = reqValidator(req, ["email", "password"]);
        if (!required.status) {
            throw new AppError({message: required.message, statusCode: 400});
        }

        const email = req.body.email;
        const password = req.body.password;

        if (!AuthController.validateEmail(email)) {
            throw new AppError({message: "Invalid email format", statusCode: 422});
        }

        if (!AuthController.validatePassword(req.body.password)) {
            throw new AppError({message: "Password must be at least 8 characters long and contain at least one number", statusCode: 422});
        }

        const user = await AuthService.findUserByEmail(email);
        if (!user) {
            throw new AppError({message: "Invalid email or password", statusCode: 401});
        }

        const isPasswordValid = await AuthService.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new AppError({message: "Invalid email or password", statusCode: 401});
        }

        // Generate JWT token
        const token = await AuthService.generateToken({id: user.id});

        // Set token in response header
        res.setHeader("Authorization", `Bearer ${token}`);
        // Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000, // 1 hour
        });
        // Send response

        (user.password as any) = undefined
        res.status(200).json({
            data:{
                user,
                token,
            },
            message: "Login successful"
        });
    }

    /**
     * Logout a user
     * @param req - The request object
     * @param res - The response object
     * @param next - The next function
     * @return success message
     * */
    async logout(req: Request, res: Response) {
        // Implement logout logic here
        res.status(200).json({message: "Logout successful"});
    }
}




const AuthControllerInstance = new AuthController();
export default AuthControllerInstance;