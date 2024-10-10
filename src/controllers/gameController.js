const Game = require("../models/gameModel");
const User = require("../models/userModel");

const gameService = require('../services/gameService');

//Game CRUD
const createGame = async (req, res) => {
    const { firstPlayerId } = req.body;
  
    // Check if the firstPlayerId is provided
    if (!firstPlayerId) {
      return res.status(400).json({ message: 'firstPlayerId is required to create a game' });
    }
  
    try {
      const game = await gameService.createGame(firstPlayerId);
      res.status(201).json({ message: "New game created", gameId: game._id, game});
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({ message: 'Failed to create game' });
    }
};

const getGameById = async (req, res) => {
    const { gameId } = req.params;

    try {
        // Search the game by its ID and populate the teams and players
        const game = await Game.findById(gameId)
            .populate({
                path: 'teams',
                populate: {
                    path: 'players', //populate the players of the teams
                    select: 'username email' //only return the username and email of the players
                }
            });

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json(game);
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ message: 'Error fetching game' });
    }
};

const getAllGames = async (req, res) => {
    try {
        const games = await Game.find().populate('teams');
        res.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ message: 'Error fetching games' });
    }
};

const deleteGameById = async (req, res) => {
    const { gameId } = req.params;

    try {
        const deletedGame = await Game.findByIdAndDelete(gameId);

        if (!deletedGame) {
            return res.status(404).json({ message: 'Game not found' });
        }

        return res.status(200).json({ message: 'Game deleted successfully' });
    } catch (error) {
        console.error('Error deleting game:', error);
        return res.status(500).json({ error: 'Failed to delete game' });
    }
};

//Game logic

//join a game - finished
const joinGame = async (req, res) => {
    const { userId } = req.body; 

    try {
        // find a game that is waiting for players
        let game = await Game.findOne({ status: 'waiting' }).populate('teams');
        if (!game) {
            //if there is no game waiting, create a new one
            game = await gameService.createGame(userId);
        }

        //get the teams of the game
        const teams = game.teams;

        if (!teams || teams.length < 2) {
            return res.status(500).json({ error: 'No teams available to join' });
        }
        
        //check if the player is already in a team
        const isPlayerInTeam = teams.some(team => team.players.includes(userId));
        if (isPlayerInTeam) {
            return res.status(400).json({ message: 'Player is already in a team in this game' });
        }

        //check if the player is already in another game in progress
        const otherGameInProgress = await Game.findOne({
            status: 'in progress',
            'teams.players': userId, 
        });

        if (otherGameInProgress) {
            return res.status(400).json({ message: 'Player is already in another game in progress' });
        }

        //join the player to the team with less players
        const teamToJoin = teams[0].players.length <= teams[1].players.length ? teams[0] : teams[1];

        //add the user to the team
        teamToJoin.players.push(userId);
        await teamToJoin.save();

        //update the user's current game and team
        await User.findByIdAndUpdate(userId, {
            currentGame: game._id,
            team: teamToJoin._id
        });

        //Change game status to 'in progress' if both teams have 4 players
        if (teams[0].players.length === 4 && teams[1].players.length === 4) {
            game.status = 'in progress';
            await game.save();
        }

        return res.status(200).json({ gameId: game._id, message: 'User joined the game', teamId: teamToJoin._id });

    } catch (error) {
        console.error('Error joining game:', error);
        return res.status(500).json({ error: 'Failed to join game' });
    }
};

//end turn - finished
const endTurn = async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = await gameService.nextTurn(gameId);

        if (game.status === 'completed') {
            res.json({ message: 'Game completed', game });
        } else {
            res.json({ message: 'Turn ended, next team\'s turn and describer updated', game });
        }
    } catch (error) {
        console.error('Error ending turn:', error); 
        res.status(500).json({ message: 'Error ending turn', error: error.message });
    }
}

// Fuction to manage the game - IN PROGRESS 
const playGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        //const game = await gameService.verifyGameProgress(gameId); 

        const { currentTeamId, currentDescriberId, currentWord } = await gameService.getCurrentTurnInfo(gameId);

        res.status(200).json({
            message: 'Game in progress',
            currentTeamId,
            currentDescriberId,
            currentWord
        });
    } catch (error) {
        res.status(500).json({ message: 'Error playing game:', error: error.message });
    }
};

//just to test

const updateGame = async (gameId, updates) => {
    try {
        const updatedGame = await Game.findByIdAndUpdate(
            gameId, 
            {
                $set: updates,
                $unset: { similarWords: "" }
            },
            { new: true } 
        );
        
        if (!updatedGame) {
            return { message: "Game not found" };
        }

        return updatedGame;
    } catch (error) {
        console.error("Error updating game:", error);
        return { message: "Error updating game", error };
    }
};

const gameId = "67003c5b011492a5cb473d7b";
const updates = {
    "describerIndices.team2": 0,
    "describerIndices.team1": 0,
    "currentRound": 0, 
    currentTurnTeam: "67003c5b011492a5cb473d77", // Modifica el equipo actual
    currentDescriber: "6700377e011492a5cb473d73" // Modifica el describer actual
};

updateGame(gameId, updates)
    .then(updatedGame => console.log("Game updated:", updatedGame))
    .catch(err => console.error(err)); 





module.exports = {
     createGame,
     joinGame,
     getGameById,
     deleteGameById,
     endTurn,
     playGame,
     getAllGames
};
