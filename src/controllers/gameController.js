const Game = require('../models/gameModel');
const Team = require('../models/teamModel'); 
const User = require('../models/userModel');

//join a game
const joinGame = async (req, res) => {
    const { userId } = req.body; 

    try {
        
        // find a game that is waiting for players
        let game = await Game.findOne({ status: 'waiting' }).populate('teams');
        if (!game) {

            //if there is no game waiting, create a new one
            const team1 = await Team.create({ teamName: 'Team 1', players: [] });
            const team2 = await Team.create({ teamName: 'Team 2', players: [] });

            game = await Game.create({
                teams: [team1._id, team2._id],
                rounds: 3,
                currentRound: 0,
                status: 'waiting',
                currentTurnTeam: team1._id,
                currentWord: 'placeholder', // !!! here goes the logic to get a random word
                currentDescriber: userId,  //the first user to join the game will be the describer
            });
        }

        //get the teams of the game
        const teams = await Team.find({ _id: { $in: game.teams } });
        
        //check if the player is already in a team
        const isPlayerInTeam = teams.some(team => team.players.includes(userId));
        if (isPlayerInTeam) {
            return res.status(400).json({ message: 'Player is already in a team' });
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
        if (teams[0].players.length == 4 && teams[1].players.length == 4) {
            game.status = 'in progress';
            await game.save();
        }

        return res.status(200).json({ gameId: game._id, message: 'User joined the game', teamId: teamToJoin._id });

    } catch (error) {
        console.error('Error joining game:', error);
        return res.status(500).json({ error: 'Failed to join game' });
    }
};

//to see the game information
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

        //return game information
        res.json(game);
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ message: 'Error fetching game' });
    }
};

//to end the turn
const endTurn = async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = await nextTurn(gameId); //function to change the turn

        if (game.status === 'completed') {
            res.json({ message: 'Game completed', game });
        } else {
            res.json({ message: 'Turn ended, next team\'s turn', game });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error ending turn' });
    }
};

async function nextTurn(gameId) {

    //find the game by its ID
    const game = await Game.findById(gameId);

    //if the game does not exist
    if (!game) {
        throw new Error('Game not found');
    }

    //check if the game is in progress
    if(game.status === 'in progress'){

        const team1 = game.teams[0];
        const team2 = game.teams[1];

        if (game.currentTurnTeamId.toString() === team1.toString()) {
            game.currentTurnTeamId = team2; //change the turn to the other team
        } else {
            game.currentTurnTeamId = team1;
            game.currentRound++; //if both teams played, increase the round
        }

        //if they played all rounds, the game is completed
        if (game.currentRound > game.rounds) {
            game.status = 'completed'; 

            // TO DO - ADD LOGIC TO DETERMINE THE WINNER
            // 1) check which team is the winner --> with team score
            // 2) update the user's current game and team
            // 3) update the user's gamesPlayed and gamesWon

        }else{
            // Update describer for the current team
            const currentTeam = await Game.findById(game.currentTurnTeamId);
            game.currentDescriber = getNextDescriber(currentTeam);

            // Get a new word for the current round
            game.currentWord = getNewWord();  // !!! here goes the logic to get a random word    
            game.similarWords = getSimilarWords(game.currentWord); // !!! here goes the logic to get similar words
        }

        await game.save();
        return game;
        
    }else{
        throw new Error('Game is not in progress or already finished');
    }   
}

function getNextDescriber(team) {
    const describerIndex = team.players.indexOf(team.currentDescriber);
    const nextIndex = (describerIndex + 1) % team.players.length;
    return team.players[nextIndex];
}


// Fuction to manage the game - IN PROGRESS
async function playGame(req, res) {
    const { gameId } = req.body; //recieve the game ID from the request body
    const { io } = req.app.get('socketio'); //get the socket.io instance

    try {
        const game = await Game.findById(gameId).populate('teams currentTurnTeamId');
        
        if (!game || game.status !== 'in progress') {
            return res.status(404).json({ message: 'Game not found or not in progress' });
        }

        // Emit the gameStart event to all players in the game
        io.to(gameId).emit('gameStart', { message: 'Game has started!', game });

        while (game.status === 'in progress') {
            // Emit the yourTurn event to the current team
            io.to(game.currentTurnTeamId.toString()).emit('yourTurn', {
                currentDescriber: game.currentDescriber,
                wordToGuess: game.currentWord,
            });

            // Wait for the turn to end - 60 seconds 
            await new Promise(resolve => setTimeout(resolve, 60000)); 

            // Finish the turn and get the updated game
            const updatedGame = await nextTurn(game._id);

            // emit the turnEnd event to all players in the game
            io.to(gameId).emit('turnEnd', {
                message: `Turn ended. Next team's turn`,
                nextTeamId: updatedGame.currentTurnTeamId,
            });

            // If the game is completed, emit the gameEnd event
            if (updatedGame.status === 'completed') {
                io.to(gameId).emit('gameEnd', { message: 'Game over!', updatedGame });
                break;
            }
        }

        return res.status(200).json({ message: 'Game is in progress', game });

    } catch (error) {
        console.error('Error in playGame:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


//function to delete a game
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



module.exports = {
     joinGame,
     getGameById,
     deleteGameById,
     endTurn,
     playGame
};



