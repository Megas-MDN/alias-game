const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController'); 
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/join', authenticateToken, gameController.joinGame); 
router.get('/:gameId', gameController.getGameById); //to check the game status
router.delete('/:gameId', gameController.deleteGameById); //to delete the game
router.post('/:gameId/endTurn', gameController.endTurn);

//to play the game - IN PROGRESS
router.post('/play', authenticateToken, gameController.playGame);


module.exports = router;

