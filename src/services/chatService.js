const ChatModel = require("../models/chatModel");

const listAllChats = async (query = {}) => {
  const filters = {
    ...(query.gameId && { gameId: query.gameId }),
    ...(query.userId && { userId: query.userId }),
    ...(query.teamId && { teamId: query.teamId }),
    ...(query.message && { message: { $regex: query.message, $options: "i" } }),
  };
  const chats = await ChatModel.find(filters)
    .populate({
      path: "userId",
      select: "username",
    })
    .select("-__v ")
    .sort({ createdAt: -1 });

  return chats;
};

const getChatById = async (chatId) => {
  const chat = await ChatModel.findById(chatId);
  return chat;
};

const updateChat = async (chatId, data = {}) => {
  const chat = await ChatModel.findById(chatId);
  if (!chat) {
    return null;
  }

  if (chat.userId !== data.userId) {
    return null;
  }

  chat.gameId = data.gameId || chat.gameId;
  chat.teamId = data.teamId || chat.teamId;
  chat.message = data.message || chat.message;
  chat.messageType = data.messageType || chat.messageType;
  return chat.save();
};

const deleteChat = async (chatId) => {
  const chat = await ChatModel.findById(chatId);
  if (!chat) {
    return null;
  }
  return chat.remove();
};

const createChat = async (data = {}) => {
  const newChat = {
    gameId: data.gameId,
    teamId: data.teamId,
    userId: data.userId,
    message: data.message || "",
    messageType: data.messageType || "guess",
  };
  const chat = await ChatModel.create(newChat);
  return chat;
};

module.exports = {
  listAllChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
};
