import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import userRoute from "./routes/users";
import passport, { use } from "passport";
import cors from "cors";
import roomsRoute from "./routes/rooms";
import { Message } from "./models/Message";
import { addDoc } from "firebase/firestore";
import {
  addMessage,
  getPrivateMessage,
  getRoomMessages,
  messagesRef,
} from "./services/message-services";
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
  if (room === socket.id) {
    return;
  }
  socket.leave(room);
  console.log(`Usuário ${socket.id} saiu da sala ${room}`);
};
type UserWithotPassword = Omit<User, "password"> & { socketId: string };

interface OnlineUsers {
  [key: string]: UserWithotPassword;
}

const onlineUsers: OnlineUsers = {};

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const user = Object.values(onlineUsers).find(
      (user) => user.socketId === socket.id
    );
    if (user) {
      delete onlineUsers[user.id];
      io.emit("get_users", Object.values(onlineUsers));
    }
  });
  socket.on("turn_online", (user: UserWithotPassword) => {
    onlineUsers[user.id] = { ...user, socketId: socket.id };
    io.emit("get_users", Object.values(onlineUsers));
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
  socket.on(
    "select_user",
    async (targetId: string, callback: (...args: any[]) => void) => {
      const userId = socket.handshake.auth.id;
      const messages = await getPrivateMessage(userId, targetId);
      callback(messages);
    }
  );
  socket.on("leave", () => {
    socket.rooms.forEach((room) => onLeaveRoom(room, socket));
  });
  socket.on("message_room", async (message: Message) => {
    const newMessage = await addMessage(message);
    io.to(message.targetId).emit("message_room", newMessage);
  });
  socket.on("private_message", async (message: Message) => {
    const target = onlineUsers[message.targetId];
    const newMessage = await addMessage(message);
    if (target) {
      io.to([target.socketId, socket.id]).emit("private_message", newMessage);
    }
  });
});

io.listen(8000);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ hello: "World" });
});
app.listen(8080, () => console.log("Servidor rodando na porta *:8080"));
