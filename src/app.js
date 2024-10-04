require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const swaggerUi = require('swagger-ui-express'); 
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./src/utils/swagger.yaml');

const userRoutes = require("../src/routes/authRoutes");
const gameRoutes = require("../src/routes/gameRoutes");
const chatRoutes = require("../src/routes/chatRoutes");

const app = express();

// Middleware
app.use(express.static("public"));
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/chats", chatRoutes);

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Main Route
app.get("/", (req, res) => {
  res.send("Alias Game API");
});

module.exports = app;
