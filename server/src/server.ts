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
import { User } from "./models/User";

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
type UserWithotPassword = Omit<User, "password">;
interface OnlineUser extends UserWithotPassword {
  socketId: string;
}

const onlineUsers: OnlineUser[] = [];

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const userIndex = onlineUsers.findIndex(
      ({ socketId }) => socketId === socket.id
    );
    onlineUsers.splice(userIndex, 1);
    io.emit("get_users", onlineUsers);
  });
  socket.on("turn_online", (user: UserWithotPassword) => {
    if (!onlineUsers.some(({ id }) => user.id === id)) {
      onlineUsers.push({ ...user, socketId: socket.id });
    }
    io.emit("get_users", onlineUsers);
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
