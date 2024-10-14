require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const { socketSetup, getIO } = require("../src/sockets/socket");

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const app = require("../src/app");

// Connect MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const server = http.createServer(app);
    socketSetup(server);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

  

module.exports = { getIO };
