import {prisma} from "../../prisma/prisma.client";


class UserRepository {

    /**
     * data is an object that contains the user data to be created
     * * @param data
     * * @returns created user object
     * * @throws {Error} if there is an error creating the user
     */
    async registerUser(data:any) {
       try{
           return await prisma.users.create({
               data,
           })
       }catch(err: any){
           console.log("user repo")
           throw new Error(err.message)
       }
    }


    async addUser(data:any) {
        try{
            return await prisma.users.create({
                data,
            })
        }catch(err: any){
            console.log("user repo")
            throw new Error(err.message)
        }
    }

    /**
     * data is an object that contains the user data to be updated
     * * @param id
     * * @param data
     * * @returns updated user object
     * * @throws {Error} if there is an error updating the user
     */
    async updateUser(id: string, data:object) {
       try{
           return await prisma.users.update({
               where: {
                   id,
               },
               data,
           });
       }catch(err: any){
              throw new Error(err.message);
       }
    }

    /**
     * id is the id of the user to be deleted
     * * @param id
     * * @returns deleted user object
     * * @throws {Error} if there is an error deleting the user
     */
    async deleteUser(id: string) {
        try{
            return await prisma.users.delete({
                where: {
                    id,
                },
            });
        }catch(err: any){
            throw new Error(err.message);
        }
    }

    /**
     * id is the id of the user to be found
     * * @param id
     * * @returns user object
     * * @throws {Error} if there is an error finding the user
     */
    async findUserById(id: string) {
        try{
            return await prisma.users.findUnique({
                where: {
                    id,
                },
            });
        }catch(e: any){
            throw new Error(e.message);
        }
    }

    /**
     * email is the email of the user to be found
     * * @param email
     * * @returns user object
     * * @throws {Error} if there is an error finding the user
     */
    async findUserByEmail(email: string) {
        try{
            return await prisma.users.findUnique({
                where: {
                    email,
                },
            });
        }catch(e: any){
            throw new Error(e.message);
        }
    }

}


const UserRepo = new UserRepository();
export default UserRepo;