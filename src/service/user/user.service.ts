import userRepo from "../../repository/user/user.repo";


class UserService {

    async userProfile(id: string) {
        const user = await userRepo.findUserById(id);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async addMember(data: object) {
        try {
            // return await userRepo.addMember(data);
        } catch (error) {
            throw new Error("Error adding member");
        }
    }


}






export default new UserService()