const mongoose = require("mongoose");
const app = require("../../app");
const supertest = require("supertest");
const { signToken } = require("../../utils/jwt");

const BASE_PATH = "/api/chats";

const token = signToken(
  { id: "66fedbcd52619e12028fb7b7", username: "Megas" },
  "yourSecret",
  "1h",
);

describe("Chat messages", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/aliasgame");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it.skip("GET - list all chats", async () => {
    const response = await supertest(app).get(BASE_PATH);
    /*
        [
      {
        _id: '66ff16b73758f8f5b37b2123',
        gameId: '66fedf7e772c64b73cd38b1b',
        teamId: '66fedf7e772c64b73cd38b1b',
        userId: { _id: '66fedbcd52619e12028fb7b7', username: 'Megas' },
        message: 'Lorem ipsum XXX',
        messageType: 'guess',
        createdAt: '2024-10-03T22:12:07.568Z',
        updatedAt: '2024-10-03T22:12:07.568Z'
      },]
    */
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.status).toBe(200);
  });

  it.skip("GET - Chat by id", async () => {
    const chatId = "66fedf7e772c64b73cd38b1b";
    const response = await supertest(app).get(BASE_PATH + "/" + chatId);
    /*
    {
      _id: '66fedf7e772c64b73cd38b1b',
      gameId: '66fede6b7664cf99c3e16ab8',
      teamId: '66fede6b7664cf99c3e16ab4',
      userId: '66fedbcd52619e12028fb7b7',
      message: 'Lorem ipsum',
      messageType: 'guess',
      createdAt: '2024-10-03T18:16:30.649Z',
      updatedAt: '2024-10-03T18:16:30.649Z',
      __v: 0
    }

*/
    expect(Array.isArray(response.body)).toBe(false);
    expect(response.body).toHaveProperty("message", "Lorem ipsum");
    expect(response.status).toBe(200);
  });

  it.skip("POST - Create Chat", async () => {
    const response = await supertest(app)
      .post(BASE_PATH)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        gameId: "66fedf7e772c64b73cd38b1b",
        teamId: "66fedf7e772c64b73cd38b1b",
        message: "Lorem ipsum XXX",
        messageType: "guess",
      });
    /*
      {
      gameId: '66fedf7e772c64b73cd38b1b',
      teamId: '66fedf7e772c64b73cd38b1b',
      userId: '66fedbcd52619e12028fb7b7',
      message: 'Lorem ipsum XXX',
      messageType: 'guess',
      _id: '66ff16b73758f8f5b37b2123',
      createdAt: '2024-10-03T22:12:07.568Z',
      updatedAt: '2024-10-03T22:12:07.568Z',
      __v: 0
    }
  */
    expect(response.body).toHaveProperty("message", "Lorem ipsum XXX");
    expect(response.status).toBe(200);
  });
});
