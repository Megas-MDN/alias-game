require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("../src/routes/authRoutes");
const gameRoutes = require("../src/routes/gameRoutes");
const chatRoutes = require("../src/routes/chatRoutes");
const http = require("http");
const socketSetup = require("../src/sockets/socket");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/chats", chatRoutes);

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

// Main Route
app.get("/", (req, res) => {
  res.send("Alias Game API");
});
