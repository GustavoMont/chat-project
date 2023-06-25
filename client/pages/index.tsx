import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/services/socket";
import { GetServerSideProps } from "next";
import { getToken } from "@/services/auth";
import { serverSideAPi } from "@/services/api";
import { Room } from "@/models/Room";
import { useForm } from "react-hook-form";
import { ChatBubble } from "@/components/Chat/ChatBubble";
import Tabs from "@/components/Common/Tabs";
import { User } from "@/models/User";
import { UsersList } from "@/components/User/UsersList";
import { RoomsList } from "@/components/Room/RoomsList";
import { Message } from "postcss";
import { Target } from "@/models/Target";
import { ChatContainer } from "@/components/Chat/ChatContainer";

const inter = Inter({ subsets: ["latin"] });

interface Props {
  rooms: Room[];
  currentUser: User;
}

interface OnlineUser extends User {
  socketId: string;
}

export default function Home({ rooms, currentUser }: Props) {
  const [target, setTarget] = useState<Target>();
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const tabs = [
    {
      title: "Salas",
      content: (
        <RoomsList
          rooms={rooms}
          onSelect={({ id, name }) =>
            setTarget({
              id,
              name,
              type: "room",
            })
          }
        />
      ),
    },
    {
      title: "Usuários",
      content: (
        <UsersList
          currentUser={currentUser}
          users={users}
          onSelect={({ id, name }) =>
            setTarget({
              id,
              name,
              type: "user",
            })
          }
        />
      ),
    },
  ];

  useEffect(() => {
    const getRoomMessages = (newMessage: Message) => {
      setMessages((messages) => [...messages, newMessage]);
    };
    const getOnlineUsers = (users: OnlineUser[]) => {
      setUsers(users);
    };
    const getPrivateMessge = (newMessage: Message) => {
      setMessages((oldMessages) => [...oldMessages, newMessage]);
    };
    socket.auth = { id: currentUser.id };
    socket.connect();
    socket.emit("turn_online", currentUser);

    socket.on("message_room", getRoomMessages);
    socket.on("get_users", getOnlineUsers);
    socket.on("private_message", getPrivateMessge);

    return () => {
      socket.disconnect();
      socket.off("message_room", getRoomMessages);
      socket.off("private_message", getPrivateMessge);
      socket.off("get_users", getOnlineUsers);
    };
  }, []);

  useEffect(() => {
    setMessages([]);
    if (target) {
      const eventName = target.type === "room" ? "select_room" : "select_user";
      socket.emit(eventName, target.id, (messages: Message[]) => {
        setMessages(messages);
      });
    } else {
      socket.emit("leave");
    }
  }, [target]);

  return (
    <main className={`flex p-5 gap-5 h-screen ${inter.className}`}>
      <div className="flex flex-col gap-5 w-1/2 max-h-screen">
        <Tabs tabs={tabs} />
      </div>
      <div
        className={`flex flex-wrap w-full h-full px-5 py-5 rounded-lg ${
          target ? "" : "justify-center items-center"
        }`}
      >
        {target ? (
          <ChatContainer
            currentUser={currentUser}
            messages={messages}
            onGetOut={() => setTarget(undefined)}
            target={target}
          />
        ) : (
          <button className="btn btn-primary" disabled>
            <h2 className="text-center text-lg font-bold text-slate-800">
              Nenhuma sala selecionada
            </h2>
          </button>
        )}
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = getToken(ctx);
  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
      props: {},
    };
  }
  const { data: rooms } = await serverSideAPi(ctx).get<Room[]>("/rooms");
  const { data: currentUser } = await serverSideAPi(ctx).get<User>("/users/me");

  return {
    props: {
      rooms,
      currentUser,
    },
  };
};
