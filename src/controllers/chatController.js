const Chat = require('../models/chatModel');

exports.createChatMessage = async (req, res) => {
    try {
        const newMessage = new Chat(req.body);
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ error: 'Error creating chat message' });
    }
};


