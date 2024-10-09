const stringSimilarity = require('string-similarity');
const teamService = require('../services/teamService');  // Use teamService to manage teams

const options = {
  minLength: 3, // Minimum word length
  maxLength: 8  // Maximum word length 
};

class WordService {
  constructor() {
    this.rooms = {};  // Stores room info, including teams
  }

  // Async method to generate a new wo
  async generateWord() {
    try {
      const randomWords = await import('random-words'); // Import dynamically
      const wordData = randomWords.generate(options); // Access the default export
      console.log(`Generated word: ${wordData}`);
      return wordData; // Return the new word
    } catch (error) {
      console.error('Error generating word:', error);
      throw new Error('Error generating word');
    }
  }

  // Async method to allow a player (from a team) to guess the word
  async guessWord(roomId, guessedWord, userId) {
    const room = this.rooms[roomId];
    
    // Find the team the player belongs to
    const team = await teamService.findUserByid(userId);

    if (!team) {
      return `User with ID ${userId} is not part of any team!`;
    }

    if (room && room.currentWord) {
      try {
        if (this.checkWordSimilarity(guessedWord, room.currentWord)) {
          room.guessedCorrectly = true;
          return `Correct guess by ${userId} from team ${team.teamName}! The word was: ${room.currentWord}`;
        } else {
          return 'Incorrect guess!';
        }
      } catch (error) {
        console.error('Error while guessing word:', error);
        return 'Error during word guessing!';
      }
    } else {
      return `No word to guess in room ${roomId}!`;
    }
  }

  // Synchronous method to check word similarity
  checkWordSimilarity(guessedWord, correctWord) {
    const similarity = stringSimilarity.compareTwoStrings(guessedWord, correctWord);
    const threshold = 0.8;  // 80% similarity
    return similarity >= threshold;
  }

  // Async method to start a new game session for teams in the room
  async startGameForTeams(roomId, teamIds) {
    this.rooms[roomId] = {
      currentWord: '',
      guessedCorrectly: false,
      teams: teamIds,  // Associate teams with the room
    };

    console.log(`Game started for Room ${roomId} with teams: ${teamIds}`);
  }
}

module.exports = WordService;

