const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController'); 
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

//game crud
router.post('/create', authenticateToken, isAdmin, gameController.createGame); 
router.get('/:gameId', authenticateToken, isAdmin, gameController.getGameById); 
router.get('/', authenticateToken, isAdmin, gameController.getAllGames); 
router.delete('/:gameId', authenticateToken, isAdmin, gameController.deleteGameById); 

//to play the game  
router.post('/join', authenticateToken, gameController.joinGame); //finished 
router.post('/:gameId/play', gameController.playGame); 
router.post('/:gameId/endTurn', gameController.endTurn); //in progress
router.post('/:gameId/winner', gameController.determineWinner); //in progress

//new
router.post('/change', gameController.changeGameStatus);



module.exports = router;

