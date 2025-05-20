import {PrismaClient} from "@prisma/client"
import {withAccelerate} from "@prisma/extension-accelerate"



const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
    omit:{
        account:{
            password: true,
        }
    }
}).$extends(withAccelerate())

export {
    prisma,
}