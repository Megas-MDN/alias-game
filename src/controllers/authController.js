require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { signToken } = require("../utils/jwt");

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: "User registered",
      user: {
        username: user.username,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        _id: user._id,
        __v: user.__v
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = signToken(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      "1h",
    );

    res.status(200).json({ message: "Logged in", token, id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const findUserById = async (id) => {
  try {
    return await User.findById(id);
  } catch (error) {
    throw new Error("Database error: " + error.message);
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  findUserById
};
