const mongoose = require("mongoose");
const inmemoryUserController = require("../../../controllers/in-memory/in-memory-userController");
const userModel = require("../../../models/userModel");

const MONGO_URl = process.env.MONGO_URI_TESTS || "mongodb://localhost:27017/aliasgame";

describe("Create User (Unit Test)", () => {

    beforeAll(async () => {
        await mongoose.connect(MONGO_URl);
        await userModel.deleteMany({});
        await mongoose.connection.close();
    });

    afterAll(async () => {
        await mongoose.connect(MONGO_URl);
        await userModel.deleteMany({});
        await mongoose.connection.close();
    });

    it("should be able to create a User", async () => {

        await mongoose.connect(MONGO_URl);

        const user = await inmemoryUserController.createUserController({
            username: "Some User",
            password: "1234"
        });

        expect(user.message).toStrictEqual("User registered");
        expect(user.res.username).toEqual("Some User");
        expect(user.res).toHaveProperty("gamesPlayed");

        await mongoose.connection.close();
    });

    it("shouldn't be able to create a User, if user already exists", async () => {

        await mongoose.connect(MONGO_URl);

        await expect(
            inmemoryUserController.createUserController({
                username: "Some User",
                password: "5678"
            })

        ).rejects.toEqual(Error('User already exists'));

        await mongoose.connection.close();
    });

});