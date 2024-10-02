const express = require('express');
const { createChatMessage } = require('../controllers/chatController');

const router = express.Router();

router.post('/', createChatMessage);

module.exports = router;
