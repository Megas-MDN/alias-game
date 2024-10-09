require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { signToken } = require("../utils/jwt");

const createAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
  
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const newAdmin = new User({
            username,
            password: hashedPassword,
            role: 'admin'
        });
  
        await newAdmin.save();
  
        const token = signToken(
            { id: newAdmin._id, username: newAdmin.username },
            process.env.JWT_SECRET,
            "1h",
          );;
  
        return res.status(201).json({ message: 'Admin created successfully', token });
    } catch (error) {
        console.error('Error creating admin:', error);
        return res.status(500).json({ message: 'Error creating admin' });
    }
  };

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

module.exports = { 
    getAllUsers,
    createAdmin
};