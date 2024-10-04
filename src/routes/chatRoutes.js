const { Router } = require("express");
const controller = require("../controllers/chatController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = Router();

router.get("/", controller.listAllChats);
router.get("/:chatId", controller.getChatById);
router.post("/", authenticateToken, controller.createChat);
router.put("/:chatId", authenticateToken, controller.updateChat);
router.delete("/:chatId", authenticateToken, controller.deleteChat);

module.exports = router;
