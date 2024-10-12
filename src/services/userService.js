const userModel = require("../models/userModel");

const createUser = async (datas) => {

    const user = {
        username: datas.username,
        password: datas.password
    }

    const createUser = await userModel.create(user);
    return createUser;
};

const getSpecificUser = async (user_id) => {
    const find = await userModel.findOne({
        _id: user_id
    });

    return find;
};

const getAllUsers = async () => {
    const users = await userModel.find();
    return users;
}

const updateUserField = async (user_id, gamesPlayed) => {
    const update = await userModel.findById(user_id);
    update.gamesPlayed = gamesPlayed;
    const res = await update.save();
    return res;
};

const deleteUser = async (user_id) => {
    await userModel.deleteOne({
        _id: user_id
    });
};

const findUserByUsername = async (username) => {
    const find = await userModel.findOne({
        username: username
    });
    return find;
};

const findUserById = async (user_id) => {

    const find = await userModel.findOne({
        _id: user_id
    });

    return find;
};

module.exports = {
    createUser,
    getAllUsers,
    getSpecificUser,
    updateUserField,
    deleteUser,
    findUserByUsername,
    findUserById
}

