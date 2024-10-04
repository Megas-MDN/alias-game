const { Server } = require("socket.io");
const chatService = require("../services/chatService");

module.exports = (server) => {
  const io = new Server(server);

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
