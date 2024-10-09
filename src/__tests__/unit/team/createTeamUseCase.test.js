const inMemoryTeamController = require("../../../controllers/in-memory/in-memory-teamController");
const inmemoryAuthController = require("../../../controllers/in-memory/in-memory-authController");
const mongoose = require("mongoose");
const userModel = require("../../../models/userModel");
const teamModel = require("../../../models/teamModel");

describe("Create Team (Unit Test)", () => {

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

    it("Should be possible to create a team, if there is a valid user with a valid token", async () => {

        await mongoose.connect(process.env.MONGO_URI_TESTS);

        const user = await inmemoryAuthController.registerUser({
            username: "User 1",
            password: "1234"
        });

        const login = await inmemoryAuthController.loginUser({
            username: user.res.username,
            password: "1234"
        });

        const { token } = login;

        const createTeam =  await inMemoryTeamController.createTeamController({
            teamName: "Team 1",
            userId: user.res._id,
            token: token
        });

        expect(createTeam.teamName).toEqual("Team 1");
        expect(createTeam).toHaveProperty("players");

        await mongoose.connection.close();
    });

    it("Should not be able to create a team, if 'TeamName' field not be string", async () => {

        await mongoose.connect(process.env.MONGO_URI_TESTS);

        const user = await inmemoryAuthController.registerUser({
            username: "User 2",
            password: "4466"
        });

        const loginUser = await inmemoryAuthController.loginUser({
            username: user.res.username,
            password: "4466"
        });

        const { token } = loginUser;

        await expect(
            inMemoryTeamController.createTeamController({
                teamName: 8899,
                userId: user.res._id,
                token: token
            })

        ).rejects.toEqual(Error("The teamName field must be a string !"));;

        await mongoose.connection.close();
    });

    it("Should not be able to create a team, if user already have a team", async () => {

        await mongoose.connect(process.env.MONGO_URI_TESTS);

        const user = await inmemoryAuthController.registerUser({
            username: "User 7",
            password: "9922"
        });

        const loginUser = await inmemoryAuthController.loginUser({
            username: user.res.username,
            password: "9922"
        });

        const { token } = loginUser;

        await inMemoryTeamController.createTeamController({
            teamName: "Team 8",
            userId: user.res._id,
            token: token
        });

        await expect( 
            inMemoryTeamController.createTeamController({
                teamName: "Team 8",
                userId: user.res._id,
                token: token
            })

        ).rejects.toEqual(Error("User already have a team !"));

        await mongoose.connection.close();
    });

    it("Should not be able to create a team, if 'token' isn't valid", async () => {

        await mongoose.connect(process.env.MONGO_URI_TESTS);

        const user = await inmemoryAuthController.registerUser({
            username: "User 3",
            password: "5577"
        });

        const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDU5MTdhOGQ1MWF";

        await expect(
            inMemoryTeamController.createTeamController({
                teamName: "Team 8",
                userId: user.res._id,
                token: fakeToken
            })

        ).rejects.toEqual(Error('Invalid Token !'));

        await mongoose.connection.close();
    });

});
