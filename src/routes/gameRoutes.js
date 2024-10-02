const express = require('express');
const { createGame } = require('../controllers/gameController');

const router = express.Router();

router.post('/', createGame);

module.exports = router;
