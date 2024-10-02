import { app } from "./app.js";

const port = process.env.SERVER_PORT;
const host = process.env.SERVER_HOST;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running at ${host}:${port}`);
});
