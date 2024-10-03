import * as chatService from "../services/chatService.js";

export const listAllChats = async (req, res) => {
  const chatMessages = await chatService.listAllChats(req.query);
  return res.status(200).json(chatMessages);
};
