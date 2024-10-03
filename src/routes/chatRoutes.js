const { Router } = require("express");
const controller = require("../controllers/chatController");

const router = Router();

router.get("/", controller.listAllChats);

module.exports = router;
