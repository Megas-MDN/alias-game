const Game = require("../models/gameModel");
const Team = require("../models/teamModel");

const WordService = require("./wordService");
const userService = require("./userService");
const TeamService = require("./teamService");

const wordService = new WordService();

class GameService {
  async createGame(firstPlayerId) {
    if (!firstPlayerId) {
      throw new Error("firstPlayerId is required to create a game");
    }

    try {
      const team1 = await Team.create({
        teamName: "Team 1",
        players: [firstPlayerId],
      });
      const team2 = await Team.create({ teamName: "Team 2", players: [] });

      const game = await Game.create({
        teams: [team1._id, team2._id],
        rounds: 3,
        currentRound: 0,
        status: "waiting",
        currentTurnTeam: team1._id,
        currentWord: await wordService.generateWord(),
        currentDescriber: firstPlayerId,
      });

      return game;
    } catch (error) {
      console.error("Error creating game:", error);
      throw new Error("Game creation failed");
    }
  }

  async verifyGameProgress(gameId) {
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "in progress") {
      throw new Error("Game is not in progress or already finished");
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
    const game = await Game.findById(gameId).populate("teams");

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status === "in progress") {
      const team1 = game.teams[0];
      const team2 = game.teams[1];

      console.log("Team 1:", team1);
      console.log("Team 2:", team2);

      //Change the turn to the other team
      if (game.currentTurnTeam.toString() === team1._id.toString()) {
        game.currentTurnTeam = team2._id;
        game.describerIndices.team2 =
          (game.describerIndices.team2 + 1) % team2.players.length;
        game.currentDescriber = team2.players[game.describerIndices.team2];
      } else {
        game.currentTurnTeam = team1._id;
        game.describerIndices.team1 =
          (game.describerIndices.team1 + 1) % team1.players.length;
        game.currentDescriber = team1.players[game.describerIndices.team1];

        game.currentRound++;
      }

      // If they played all rounds, the game is completed
      if (game.currentRound > game.rounds) {
        game.status = "finished";
        console.log("Game finished!");
        await this.determineWinner(gameId);
      } else {
        const currentTeam = game.teams.find(
          (t) => t._id.toString() === game.currentTurnTeam.toString(),
        );

        console.log("Current Team:", currentTeam);

        if (
          !currentTeam ||
          !currentTeam.players ||
          currentTeam.players.length === 0
        ) {
          console.error("Invalid team or no players in the team:", currentTeam);
          throw new Error("Current team or its players are invalid");
        }

        console.log("Players in current team:", currentTeam.players);

        //get a new word for the next turn
        game.currentWord = await wordService.generateWord();

        await game.save();
        return game;
      }
    } else {
      throw new Error("Game is not in progress or already finished");
    }
  }

  //to get all games in progress - backend

  async getCurrentWord(gameId) {
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    return game.currentWord;
  }

  //new
  async determineWinner(gameId) {
    try {
      const game = await Game.findById(gameId).populate("teams");

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.status == "finished") {
        //get the points of each team
        const pointsTeam1 = game.teams[0].score;
        const pointsTeam2 = game.teams[1].score;

        console.log(`Team 1: ${pointsTeam1} points`);
        console.log(`Team 2: ${pointsTeam2} points`);

        let winnerTeam = null;

        if (pointsTeam1 > pointsTeam2) {
          winnerTeam = game.teams[0];
        } else if (pointsTeam2 > pointsTeam1) {
          winnerTeam = game.teams[1];
        } else {
          console.log("The game is a tie!");
          return winnerTeam;
          // who is the winner (?)
        }

        //update user stats
        console.log(`The winner is: ${winnerTeam.teamName}`);
        await this.updateUserGameStats(winnerTeam._id);
        //update user current game and team
        await this.updateCurrentGameAndTeam(winnerTeam._id);
      } else {
        throw new Error("Game is not finished yet");
      }
    } catch (error) {
      console.error("Error determining the winner:", error);
      throw new Error("Error determining the winner");
    }
  }

  async updateUserGameStats(teamId) {
    console.log(`Updating user stats for team ${teamId}`);
    const usersInTeam = await TeamService.getUsersByTeamId(teamId); //Get all users in the team

    console.log("Users in team:", usersInTeam);
    for (const user of usersInTeam) {
      await userService.updateUserStats(user._id); // Update user stats
      console.log(`User stats updated`);
    }
  }

  async updateCurrentGameAndTeam(teamId) {
    console.log(`Updating current game and team for team ${teamId}`);
    const usersInTeam = await TeamService.getUsersByTeamId(teamId); //Get all users in the team
    for (const user of usersInTeam) {
      await userService.updateUserCurrentGameAndTeam(user._id); // Update user current game and team
      console.log(`User current game and team updated`);
    }
  }

  //new
  async processGuess(chatMessage) {
    const { gameId, teamId, message, messageType } = chatMessage;

    if (messageType === "guess") {
      const correctWord = await this.getCurrentWord(gameId);

      const points = await wordService.checkUserGuess(correctWord, message);

      if (points > 0) {
        //update team points
        await TeamService.updateTeamPoints(teamId, points);
        console.log(`Team ${teamId} receives ${points} points!`);
      } else {
        console.log(`No points awarded for team ${teamId}.`);
      }
    }
  }

  //new
  async changeGameStatus(gameId, status) {
    const game = await Game.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    game.status = status;
    await game.save();
    return game;
  }
}

module.exports = new GameService();
