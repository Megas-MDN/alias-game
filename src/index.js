require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const socketSetup = require("../src/sockets/socket");
const seedDatabase = require("../src/utils/seed"); 

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const app = require("../src/app");

// Connect MongoDB
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await seedDatabase();  //call seedDatabase function

    const server = http.createServer(app);
    socketSetup(server);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

// start server
startServer();