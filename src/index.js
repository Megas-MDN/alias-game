const mongoose = require("mongoose");
const http = require("http");
const socketSetup = require("../src/sockets/socket");
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const app = require("../src/app");

// Connect MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
