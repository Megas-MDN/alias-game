const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController'); 
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/join', authenticateToken, gameController.joinGame); 
router.get('/:gameId', gameController.getGameById); //to check the game status

module.exports = router;

