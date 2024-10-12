const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController'); 
const { authenticateToken } = require('../middlewares/authMiddleware');

//game crud
router.post('/create', authenticateToken, gameController.createGame); //should require another authentication
router.get('/:gameId', authenticateToken, gameController.getGameById); //should require another authentication 
router.get('/', gameController.getAllGames); //should require another authentication
router.delete('/:gameId', authenticateToken, gameController.deleteGameById); //should require another authentication

//to play the game  
router.post('/join', authenticateToken, gameController.joinGame); //finished
router.post('/:gameId/play', gameController.playGame);
router.post('/:gameId/endTurn', gameController.endTurn); //in progress
router.post('/:gameId/winner', gameController.determineWinner); //in progress

//new
router.post('/change', gameController.changeGameStatus);



module.exports = router;

