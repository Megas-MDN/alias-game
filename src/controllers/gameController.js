const Game = require('../models/gameModel');
const Team = require('../models/teamModel'); 
const User = require('../models/userModel');

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

const endTurn = async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = await nextTurn(gameId); //function to change the turn
        res.json({ message: 'Turn ended, next team\'s turn', game });
    } catch (error) {
        res.status(500).json({ message: 'Error ending turn' });
    }
};

async function nextTurn(gameId) {

    //find the game by its ID
    const game = await Game.findById(gameId);

    //if the game does not exist
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }

    //check if the game is in progress
    if(game.status === 'in progress'){

        const team1 = game.teams[0];
        const team2 = game.teams[1];

        if (game.currentTurnTeamId.toString() === team1.toString()) {
            game.currentTurnTeamId = team2; 

            //aca deberia hacer el cambio del currentDescriber, y la palabra to guess
        } else {
            game.currentTurnTeamId = team1;
            game.currentRound++; //if both teams played, increase the round

            //aca se deberia hacer el cambio del currentDescriber y la palabra to guess
        }

        if (game.currentRound > game.rounds) {
            game.status = 'completed'; //if they played all rounds, the game is completed

            // TO DO - when the game is completed 
            // 1) check which team is the winner --> with team score
            // 2) update the user's current game and team
            // 3) update the user's gamesPlayed and gamesWon
        }

        await game.save();
        return game;
        
    }else{
        return res.status(404).json({ message: 'Game status waiting or finished' });
    }
    
}


module.exports = {
     joinGame,
     getGameById,
     endTurn
};



