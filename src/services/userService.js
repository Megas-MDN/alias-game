const userModel = require("../models/userModel");

const updateUserStats = async (userId) => {
    const user = await userModel.findById(userId);
    if (user) {
        user.gamesPlayed += 1;
        user.gamesWon += 1;
        await user.save();
    }
    console.log(`desde user model jugados ${user.gamesPlayed}, ganados ${user.gamesWon}`);
}

const updateUserCurrentGameAndTeam = async (userId) => {
    await userModel.findByIdAndUpdate(userId, {
        currentGame: null,
        team: null
    });
}


module.exports = {
    updateUserStats,
    updateUserCurrentGameAndTeam
}
