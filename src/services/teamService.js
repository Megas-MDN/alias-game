const teamModel = require("../models/teamModel");

const createTeamService = async (datas) => {
    const team = {
        teamName: datas.teamName,
        players: [datas.userId]
    }

    const createTeam = await teamModel.create(team);
    return createTeam;
};

const getSpecificTeam = async (team_id) => {
    const find = await teamModel.findById(team_id);
    return find;
};

const getAllTeams = async () => {
    const find = await teamModel.find();
    return find;
};


const updateSpecificTeamField = async (team_id, teamName) => {
    const docFind = await teamModel.findById(team_id);
    docFind.teamName = teamName;
    const res = await docFind.save();
    return res;
};

const deleteTeam = async (team_id) => {
    await teamModel.deleteOne({
        _id: team_id
    });
};

const findUserByid = async (user_id) => {
    const find = await teamModel.findOne({
        players: user_id
    });

    return find;
};

module.exports = { 
    createTeamService, 
    getSpecificTeam,
    getAllTeams,
    updateSpecificTeamField,
    deleteTeam,
    findUserByid,
};