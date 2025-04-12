import userRepo from "../../repository/user.repo";


class UserService {

    async userProfile(id: string) {
        const user = await userRepo.findUserById(id);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }


}






export default new UserService()