import * as chatModel from "../models/ChatModel.js";

export const listAllChats = async (query) => {
  return chatModel.listAllChats(query);
};
