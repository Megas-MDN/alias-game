const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team', 
        required: true, 
    }],
    rounds: {
        type: Number,
        required: true, 
    },
    currentRound: {
        type: Number,
        default: 1, 
    },
    status: {
        type: String,
        enum: ['waiting', 'in progress', 'finished'], 
        default: 'waiting', 
    },
    currentTurnTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team', 
        required: true, 
    },
    currentDescriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true, 
    },
    currentWord: { //coffee 
        type: String,
        required: true, 
    }, 
    similarWords: [{ //[ tea, milk, sugar ] //library similar words
        type: String,
    }],
    correctGuesses: {
        type: Number,
        default: 0, 
    },
}, {
    timestamps: true, 
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
