import { Router } from "express";
import * as chatController from "../controllers/chatController.js";

export const routerMessages = Router();

routerMessages.get("/", chatController.listAllChats);
