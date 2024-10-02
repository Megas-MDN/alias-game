import { UserRepository } from "../../repository/userRepository.js";
import { AppError } from "../../../../error/appError.js";
import pkg from 'bcryptjs';
const { hash } = pkg;

const userRepository = new UserRepository();

export class CreateUser {

    async execute(request, response) {

        const { username, password, currentGameId, teamId} = request.body;

        if(username === "" || password === "" || currentGameId === "", teamId == "") {
            throw new AppError("Null Data is Not Allowed, Please fill in All Datas !", 400);

        }else if(typeof(username) !== "string" || typeof(password) !== "string" || typeof(currentGameId) !== "string", typeof(teamId) !== "string") {
            throw new AppError("The field's, must to be a string !", 405);

        }else {
            const findUserByUsername = await userRepository.findUserByUsername(username);

            if(findUserByUsername) {
                throw new AppError('User Already Exists!', 404);
            }

            const passwordHash = await hash(password, 8);

            const user = await userRepository.createUser({
                username,
                password: passwordHash,
                currentGameId,
                teamId
            });

            return response.status(201).json({
                user: {
                    id: user.id,
                    username: user.username,
                    gamesPlayed: user.gamesPlayed,
                    gamesWon: user.gamesWon,
                    currentGameId: user.currentGameId,
                    teamId: user.teamId,
                    createdAt: user.createdAt
                }
            });

        }
        
    }

}