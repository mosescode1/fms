import userRepo from "../../repository/user/user.repo";

class UserService {

    async findUserbyEmail(email: string): Promise<any> {
        return await userRepo.findUserByEmail(email)
    }

    async userProfile(id: string) {
        const user = await userRepo.findUserById(id);
        if (!user) {
            throw new Error("User not found");
        }
        // Exclude sensitive information
        const { password, ...userProfile } = user;
        return userProfile;
    }

    async createNewUser(data: any) {
        try {
            return await userRepo.createUserAccount(data);
        } catch (error) {
            throw new Error("Error adding member");
        }
    }

    async getAllUsers() {
        const allUser = await userRepo.getAllUsers()
        // remove password from all users
        return allUser.map((user: any) => {
            const {password, ...userProfile} = user;
            return userProfile;
        });
    }
}






export default new UserService()