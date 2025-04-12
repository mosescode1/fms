import {prisma} from "../prisma/prisma.client";
import {Prisma} from "@prisma/client";


class UserRepository {

    async createUser(data:any) {
       try{
           return await prisma.users.create({
               data,
           })
       }catch(err: any){
           console.log("user repo")
           throw new Error(err.message)
       }
    }

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