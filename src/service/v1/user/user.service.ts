import userRepo from "../../../repository/v1/user/user.repo";

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

    async findUserById(id: string) {
        return await userRepo.findUserById(id);
    }

	async getTotalUsers() {
		try{
           return userRepo.getTotalUsers();
        }catch(error:any){
            throw new Error("Error fetching total users: " + error.message);
        }
	}

    async getTotalFiles() {
        try{
            const totalFiles = await userRepo.getFiles();
            let totalSize = 0;
            // count the total size of all files
            totalFiles.forEach((file: any) => {
                totalSize += file.fileSize;
            })
            // return the total files and total size
            return {
                totalFiles: totalFiles.length,
                totalSize: totalSize
            };
        }catch (error:any){
            throw new Error("Error fetching total files: " + error.message);
        }
    }

    async getTotalMemberFiles(userId: any) {
        try{
            const totalFiles = await userRepo.getMemberFiles(userId);
            let totalSize = 0;

            // calulate for different file types
            const fileTypes = {
                images: 0,
                videos: 0,
                documents: 0,
                others: 0
            };

            totalFiles.forEach((file: any) => {
                totalSize += file.fileSize;
                // categorize files by type
                if (file.fileName.endsWith('.jpg') || file.fileName.endsWith('.png')) {
                    fileTypes.images += 1;
                } else if (file.fileName.endsWith('.mp4') || file.fileName.endsWith('.avi')) {
                    fileTypes.videos += 1;
                } else if (file.fileName.endsWith('.pdf') || file.fileName.endsWith('.docx')) {
                    fileTypes.documents += 1;
                } else {
                    fileTypes.others += 1;
                }
            });

            // count the total size of all files
            totalFiles.forEach((file: any) => {
                totalSize += file.fileSize;
            })
            // return the total files and total size
            return {
                totalFiles: totalFiles.length,
                totalSize: totalSize,
                fileTypes: fileTypes
            };
        }catch (error:any){
            throw new Error("Error fetching total member files: " + error.message);
        }
    }
}






export default new UserService()
