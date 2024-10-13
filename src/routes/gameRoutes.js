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
router.post('/join', authenticateToken, gameController.joinGame); 
router.post('/:gameId/endTurn', authenticateToken, isAdmin, gameController.endTurn); 



module.exports = router;

