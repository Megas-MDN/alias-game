const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const { authenticateToken, isAdmin } = require("../middlewares/authMiddleware");

//game crud
router.post("/create", authenticateToken, gameController.createGame);
router.get("/:gameId", authenticateToken, gameController.getGameById);
router.get("/", authenticateToken, isAdmin, gameController.getAllGames);
router.delete(
  "/:gameId",
  authenticateToken,
  isAdmin,
  gameController.deleteGameById,
);

//to play the game
router.post("/join", authenticateToken, gameController.joinGame);
router.post("/:gameId/endTurn", authenticateToken, gameController.endTurn);

module.exports = router;
