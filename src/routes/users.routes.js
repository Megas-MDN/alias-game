import { CreateUser } from "../modules/users/useCases/createUser/createUserUseCase.js";
import { Router } from "express";

export const usersRoutes = Router();

const createUser = new CreateUser();

usersRoutes.use("/createUser", createUser.execute);