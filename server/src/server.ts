import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import userRoute from "./routes/users";
import passport from "passport";
import cors from "cors";
import roomsRoute from "./routes/rooms";
import { Message } from "./models/Message";
import { addDoc } from "firebase/firestore";
import { getRoomMessages, messagesRef } from "./services/message-services";

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

const onLeaveRoom = (room: string, socket: Socket) => {
  socket.leave(room);
  console.log(`Usuário ${socket.id} saiu da sala ${room}`);
};

interface User {
  id: string;
  name: string;
  username: string;
}

io.on("connection", (socket) => {
  console.log(`Usuário: ${socket.id} conectado`);
  socket.on("disconnect", () => {
    console.log(`Usuário: ${socket.id} saiu`);
  });
  socket.on(
    "select_room",
    async (roomId: string, callback: (messages: unknown) => {}) => {
      socket.rooms.forEach((room) => onLeaveRoom(room, socket));
      socket.join(roomId);
      const messages = await getRoomMessages(roomId);
      callback(messages);
    }
  );
  socket.on("leave", () => {
    socket.rooms.forEach((room) => onLeaveRoom(room, socket));
  });
  socket.on("message", async (message: Message) => {
    const messageDoc = await addDoc(messagesRef, {
      userId: message.user.id,
      text: message.text,
      date: new Date(),
      targetId: message.targetId,
    });
    io.to(message.targetId).emit("message", {
      id: messageDoc.id,
      ...message,
    });
  });
});

io.listen(8000);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ hello: "World" });
});
app.listen(8080, () => console.log("Servidor rodando na porta *:8080"));
