const Game = require('../models/gameModel');

exports.createGame = async (req, res) => {
    try {
        const newGame = new Game(req.body);
        const savedGame = await newGame.save();
        res.status(201).json(savedGame);
    } catch (error) {
        res.status(500).json({ error: 'Error creating game' });
    }
};


