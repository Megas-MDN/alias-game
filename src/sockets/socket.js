const chatService = require("../services/chatService");

let io = {};

const socketSetup = (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("sendMessage", async (data) => {
      if (data.gameId && data.teamId && data.userId && data.message) {
        await chatService.createChat(data);
      }
      io.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

module.exports = { socketSetup, getIO };
