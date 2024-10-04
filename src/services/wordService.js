const randomWords = require('random-words');

// Alias Game Object
class wordsService {
  constructor() {
    this.rooms = {};
  }

  // Create a new room
  createRoom(roomId) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = {
        teams: { team1: [], team2: [] }, // Initialize two teams
        currentTurn: 'team1', // Start with team1
        score: { team1: 0, team2: 0 },
        currentWord: null,
        guessedCorrectly: false
      };
      console.log(`Room ${roomId} created!`);
    } else {
      console.log(`Room ${roomId} already exists.`);
    }
  }

  // Add a player to a team
  addPlayer(roomId, team, playerName) {
    const room = this.rooms[roomId];
    if (room && (team === 'team1' || team === 'team2')) {
      room.teams[team].push(playerName);
      console.log(`${playerName} added to ${team} in room ${roomId}.`);
    } else {
      console.log('Invalid room or team');
    }
  }

  // Generate a random word for the game
  generateWord(roomId) {
    const room = this.rooms[roomId];
    if (room) {
      room.currentWord = randomWords();
      room.guessedCorrectly = false;
      console.log(`New word generated for Room ${roomId}: ${room.currentWord}`);
    }
  }

  // Player guesses the word
  guessWord(roomId, team, guessedWord) {
    const room = this.rooms[roomId];
    if (room && room.currentTurn === team && room.currentWord) {
      if (guessedWord.toLowerCase() === room.currentWord.toLowerCase()) {
        console.log(`${team} guessed the word correctly!`);
        room.score[team] += 1;
        room.guessedCorrectly = true;
        this.nextTurn(roomId);
      } else {
        console.log(`Incorrect guess by ${team}.`);
      }
    } else {
      console.log('Its not your turn or no word is generated.');
    }
  }

  // Move to the next team's turns
  nextTurn(roomId) {
    const room = this.rooms[roomId];
    if (room) {
      room.currentTurn = room.currentTurn === 'team1' ? 'team2' : 'team1';
      console.log(`It's now ${room.currentTurn}'s turn in room ${roomId}.`);
      this.generateWord(roomId); // Generate a new word for the next round
    }
  }

  // Display the current score
  displayScore(roomId) {
    const room = this.rooms[roomId];
    if (room) {
      console.log(`Score in Room ${roomId}: Team1: ${room.score.team1}, Team2: ${room.score.team2}`);
    }
  }
}

// Example of how the game works
const aliasGame = new wordsService();

// Setup Room
aliasGame.createRoom('room1');

// Add players to teams
aliasGame.addPlayer('room1', 'team1', 'Alice');
aliasGame.addPlayer('room1', 'team2', 'Bob');

// Start the game by generating the first word
aliasGame.generateWord('room1');

// Team1 makes a guess
aliasGame.guessWord('room1', 'team1', 'apple'); // Example guess

// Display current score
aliasGame.displayScore('room1');

// The game automatically switches turns after a correct guess and generates a new word
aliasGame.guessWord('room1', 'team2', 'banana'); // Team2's turn

aliasGame.displayScore('room1');