const ChatModel = require("../models/chatModel");
const io = require("./socketService");
//new
const WordService = require("./wordService");
const GameService = require("./gameService");
const TeamService = require("./teamService");

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
    .sort({ createdAt: query.order ? 1 : -1 });

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
  if (chat.userId.toString() !== data.userId) {
    return null;
  }

  chat.gameId = data.gameId || chat.gameId;
  chat.teamId = data.teamId || chat.teamId;
  chat.message = data.message || chat.message;
  chat.messageType = data.messageType || chat.messageType;
  await chat.save();

  return chat;
};

const deleteChat = async (chatId) => {
  const chat = await ChatModel.findByIdAndDelete(chatId);
  return chat;
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

//new -
const handleGuessMessage = async (chatMessage) => {
  const { gameId, teamId, message, messageType } = chatMessage;

  if (messageType === "guess") {
    const correctWord = await GameService.getCurrentWord(gameId);
    const wordService = new WordService();
    const points = await wordService.checkUserGuess(correctWord, message);
    if (points > 0) {
      //update team points
      await TeamService.updateTeamPoints(teamId, points);
      console.log(`Team ${teamId} receives ${points} points!`);
    } else {
      console.log(`No points awarded for team ${teamId}.`);
    }
  }
};

module.exports = {
  listAllChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
  handleGuessMessage,
};
