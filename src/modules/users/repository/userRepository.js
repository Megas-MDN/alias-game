import { prismaService } from "../../../database/prismaService.js"

export class UserRepository {

    async createUser(datas) {
        const user = await prismaService.user.create({
            data: datas,
            include: {
                ChatMessages: true,
                currentGame: true,
                team: true
            }
        });

        return user;
    }

    async findUserByUsername(username) {
        const user = await prismaService.user.findUnique({
            where: {
                username: username
            }
        });

        return user;
    }

}