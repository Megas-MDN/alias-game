import express from "express";
import cors from "cors";
import "express-async-errors";
import { usersRoutes } from "./routes/users.routes.js";
import { AppError } from "./error/appError.js";

export const app = express();

app.use(express.json());
app.use(cors());

app.use(usersRoutes);

app.use((error, request, response, next) => {
  if (error instanceof AppError) {
    next;
    return response.status(error.statusCode).json({ message: error.message });
  }

  return response.status(500).json({
    status: "error",
    message: `Internal Server Error ${error.message}`,
  });
});
