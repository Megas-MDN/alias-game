const Game = require('../models/gameModel');
const Team = require('../models/teamModel');
const WordService = require('./wordService');

const wordService = new WordService();

class GameService {
    async createGame(firstPlayerId) {
        if (!firstPlayerId) {
            throw new Error('firstPlayerId is required to create a game');
        }

        try {
            const team1 = await Team.create({ teamName: 'Team 1', players: [firstPlayerId] });
            const team2 = await Team.create({ teamName: 'Team 2', players: [] });
         
            const game = await Game.create({
                teams: [team1._id, team2._id],
                rounds: 3,
                currentRound: 0,
                status: 'waiting',
                currentTurnTeam: team1._id,
                currentWord: await wordService.generateWord(),
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

    async nextTurn(gameId) {
        const game = await Game.findById(gameId).populate('teams');
        
        if (!game) {
            throw new Error('Game not found');
        }

        if (game.status === 'in progress') {
            const team1 = game.teams[0];
            const team2 = game.teams[1];

            console.log("Team 1:", team1);
            console.log("Team 2:", team2);

            //Change the turn to the other team
            if (game.currentTurnTeam.toString() === team1._id.toString()) {
                game.currentTurnTeam = team2._id;
                game.describerIndices.team2 = (game.describerIndices.team2 + 1) % team2.players.length;
                game.currentDescriber = team2.players[game.describerIndices.team2];
            } else {
                game.currentTurnTeam = team1._id;
                game.describerIndices.team1 = (game.describerIndices.team1 + 1) % team1.players.length;
                game.currentDescriber = team1.players[game.describerIndices.team1];

                game.currentRound++;
            }

            // If they played all rounds, the game is completed
            if (game.currentRound > game.rounds) {
                game.status = 'completed';

                // TO DO - ADD LOGIC TO DETERMINE THE WINNER
                // 1) check which team is the winner --> with team score
                // 2) update the user's current game and team
                // 3) update the user's gamesPlayed and gamesWon

            }else{
                const currentTeam = game.teams.find(t => t._id.toString() === game.currentTurnTeam.toString());

                console.log("Current Team:", currentTeam);

                if (!currentTeam || !currentTeam.players || currentTeam.players.length === 0) {
                    console.error('Invalid team or no players in the team:', currentTeam);
                    throw new Error('Current team or its players are invalid');
                }

                console.log("Players in current team:", currentTeam.players);

                //get a new word for the next turn
                game.currentWord = await wordService.generateWord();
                game.similarWords = await wordService.generateSimilarWords(game.currentWord);

                await game.save();
                return game;
            }
        }else{
            throw new Error('Game is not in progress or already finished');
        }
    }

    async getCurrentWord(gameId) {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        return game.currentWord;
    }
  
}

module.exports = new GameService();
