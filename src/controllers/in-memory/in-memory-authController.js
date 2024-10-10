require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../../models/userModel");
const { signToken } = require("../../utils/jwt");

const inmemoryAuthController = {

    async registerUser(datas) {

        try {
            // Check if user exists
            const username = datas.username;
            const password = datas.password;

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                throw new Error("User already exists");
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const user = new User({ username, password: hashedPassword });
            await user.save();

            const res = {
                username: user.username,
                gamesPlayed: user.gamesPlayed,
                gamesWon: user.gamesWon,
                _id: user.id,
                __v: user.__v
            }

            const message = "User registered";

            return { message, res }; 

        } catch (err) {
            return err.message;
        }
    },

    async loginUser(datas) {

        const username = datas.username;

        try {
            const user = await User.findOne({ username });
            if (!user) {
                 throw new Error("Invalid credentials");
            }

            // Compare password
            const isMatch = await bcrypt.compare(datas.password, user.password);
            if (!isMatch) {
                 throw new Error("Invalid credentials");
            }

            // Generate JWT
            const token = signToken(
                { id: datas.id, username: datas.username },
                process.env.JWT_SECRET,
                "1h",
            );

            return { message: "Logged in", token };
        } catch (err) {
            return err.message;
        }
    },

    async findUserById(datas) {
        try {
            return await User.findById(datas.id);
        } catch (error) {
            return "Database error: " + error.message;
        }
    },

}

module.exports = inmemoryAuthController;
