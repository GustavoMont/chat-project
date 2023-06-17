import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoute from "./routes/users";
import passport from "passport";
import cors from "cors";
import roomsRoute from "./routes/rooms";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/users", userRoute);
app.use("/rooms", roomsRoute);

app.use(passport.initialize());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log(`Usuário: ${socket.id} conectado`);
  socket.on("disconnect", () => {
    console.log(`Usuário: ${socket.id} saiu`);
  });
});

io.listen(8000);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ hello: "World" });
});

app.listen(8080, () => console.log("Servidor rodando na porta *:8080"));
