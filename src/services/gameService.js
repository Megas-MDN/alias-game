const Game = require('../models/gameModel');
const Team = require('../models/teamModel');

class GameService {
    async createGame(firstPlayerId) {
        if (!firstPlayerId) {
            throw new Error('firstPlayerId is required to create a game');
        }

        try {
            const team1 = await Team.create({ teamName: 'Team 1', players: [firstPlayerId] });
            const team2 = await Team.create({ teamName: 'Team 2', players: [] });

            const getRandomWord = () => {
                const words = ['apple', 'banana', 'orange']; // Example word list
                return words[Math.floor(Math.random() * words.length)];
            };

            const game = await Game.create({
                teams: [team1._id, team2._id],
                rounds: 3,
                currentRound: 0,
                status: 'waiting',
                currentTurnTeam: team1._id,
                currentWord: getRandomWord(),
                currentDescriber: firstPlayerId,
            });

            return game;
        } catch (error) {
            console.error('Error creating game:', error);
            throw new Error('Game creation failed');
        }
    }

    async verifyGameProgress(gameId) {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        if (game.status !== 'in progress') {
            throw new Error('Game is not in progress or already finished');
        }

        return game;
    }

    async getCurrentTurnInfo(gameId) {
        const game = await this.verifyGameProgress(gameId);

        const currentTeamId = game.currentTurnTeam;
        const currentDescriberId = game.currentDescriber;

        return { currentTeamId, currentDescriberId, currentWord: game.currentWord };
    }

    getNextDescriber(team) {
        const currentDescriberIndex = team.players.indexOf(team.currentDescriber);
        
        const nextIndex = (currentDescriberIndex + 1) % team.players.length;
        return team.players[nextIndex];
    }

    //Delete this method and use the one from the WordsService.js file
    getRandomWord() {
        const words = ['apple', 'banana', 'orange', 'grape', 'pear']; 
        return words[Math.floor(Math.random() * words.length)];
    }

    async nextTurn(gameId) {
        const game = await this.verifyGameProgress(gameId);
        console.log('game en nextTurn', game);

        const team1 = game.teams[0];
        const team2 = game.teams[1];

        //Change the turn to the other team
        if (game.currentTurnTeam.toString() === team1.toString()) {
            game.currentTurnTeam = team2;
        } else {
            game.currentTurnTeam = team1;
            game.currentRound++; // If both teams played, increase the round
        }

        // If they played all rounds, the game is completed
        if (game.currentRound > game.rounds) {
            game.status = 'completed';

            // TO DO - ADD LOGIC TO DETERMINE THE WINNER
            // 1) check which team is the winner --> with team score
            // 2) update the user's current game and team
            // 3) update the user's gamesPlayed and gamesWon

        }else{

             // Update describer for the current team
             const currentTeam = game.currentTurnTeam.toString() === team1._id.toString() ? team1 : team2;
             game.currentDescriber = this.getNextDescriber(currentTeam);
             
             // Get a new word for the current round
             game.currentWord = getNewWord();  // !!! here goes the logic to get a random word    
            //game.similarWords = getSimilarWords(game.currentWord); // !!! here goes the logic to get similar words

        }

        await game.save();
        return game;
    }
}

module.exports = new GameService();
