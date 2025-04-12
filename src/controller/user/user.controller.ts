import userRepo from "../../repository/user.repo";
import {AppError} from "../../lib";
import userService from "../../service/user/user.service";


class UserController {

    constructor() {
    }

    async userProfile(req: any, res: any) {
        const user = await userService.userProfile(req.user.userId);

        if (!user) {
            throw new AppError({message: "User not found", statusCode: 404});
        }

        (user.password as any) = undefined;

        res.status(200).json({
            status: "success",
            data: {
                user
            }
        });
    }
}

const userControllerInstance = new UserController();
export default userControllerInstance;
