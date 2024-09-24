db = db.getSiblingDB("aliasgame");

db.createCollection("users");
db.users.insertMany([
  {
    username: "player1",
    password: "e234dsdom3k2kmdl3l43iwes9vjro44223m3n32kn5n2ksdo4",
  }, // password123
  {
    username: "player2",
    password: "e234dsdom3k2kmdl3l43iwes9vjro44223m3n32kn5n2ksdo4",
  }, // password123
]);

db.createCollection("games");
