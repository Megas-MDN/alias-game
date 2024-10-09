const mongoose = require("mongoose");
const userModel = require("../../../models/userModel");
const teamModel = require("../../../models/teamModel");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");
const inMemoryTeamController = require("../../../controllers/in-memory/in-memory-teamController");

describe("Delete Team (Unit Test)", () => {

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI_TESTS);
        await userModel.deleteMany({});
        await teamModel.deleteMany({});
        await mongoose.connection.close();
    });

    afterAll(async () => {
        await mongoose.connect(process.env.MONGO_URI_TESTS);
        await userModel.deleteMany({});
        await teamModel.deleteMany({});
        await mongoose.connection.close();
    });

    it("should be able to delete a specific team", async () => {

        await mongoose.connect(process.env.MONGO_URI_TESTS);

        const user = await inmemoryAuthController.registerUser({
            username: "User 1",
            password: "4467"
        });

        const loginUser = await inmemoryAuthController.loginUser({
            username: user.res.username,
            password: "4467"
        });

        const { token } = loginUser;

        const createTeam = await inMemoryTeamController.createTeamController({
            teamName: "Team 1",
            userId: user.res._id,
            token: token
        });

        const deleteTeam = await inMemoryTeamController.deleteTeamController({
            team_id: createTeam._id,
            token: token
        });

        expect(deleteTeam).toStrictEqual({ message: "Team Deleted with sucess !" });

        await mongoose.connection.close();
    });

    it("Should not be able to delete a team, if 'team_id' is wrong", async () => {

        await mongoose.connect(process.env.MONGO_URI_TESTS);

        const user = await inmemoryAuthController.registerUser({
            username: "User 9",
            password: "1122"
        });

        const loginUser = await inmemoryAuthController.loginUser({
            username: user.res.username,
            password: "1122"
        });

        const { token } = loginUser;

        await inMemoryTeamController.createTeamController({
            teamName: "Team 4",
            userId: user.res._id,
            token: token
        });

        const fakeID = "670419ddced1765a83092133";

        await expect(
            inMemoryTeamController.deleteTeamController({
                team_id: fakeID,
                token: token
            })

        ).rejects.toEqual(Error("Team Not Found !"));

        await mongoose.connection.close();
    });

    it("Should not be able to delete a team, if 'token' isn't valid", async () => {

        await mongoose.connect(process.env.MONGO_URI_TESTS);

        const user = await inmemoryAuthController.registerUser({
            username: "User 3",
            password: "2233"
        });

        const loginUser = await inmemoryAuthController.loginUser({
            username: user.res.username,
            password: "2233"
        });

        const { token } = loginUser;

        const createTeam = await inMemoryTeamController.createTeamController({
            teamName: "Team 6",
            userId: user.res._id,
            token: token
        });

        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDQxOTd";

        await expect(
            inMemoryTeamController.deleteTeamController({
                team_id: createTeam._id,
                token: fakeToken
            })

        ).rejects.toEqual(Error("Invalid Token !"));

        await mongoose.connection.close();
    });

});