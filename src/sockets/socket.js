const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("sendMessage", (data) => {
      io.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
