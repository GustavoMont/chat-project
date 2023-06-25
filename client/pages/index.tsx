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

const inter = Inter({ subsets: ["latin"] });

interface Props {
  rooms: Room[];
  currentUser: User;
}

interface OnlineUser extends User {
  socketId: string;
}

export default function Home({ rooms, currentUser }: Props) {
  interface Target {
    id: string;
    name: string;
    type: "user" | "room";
  }
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

  const { register, setValue, handleSubmit, resetField } = useForm<Message>({
    defaultValues: {
      user: currentUser,
    },
  });

  const sendMessage = (message: Message) => {
    const eventName =
      target?.type === "room" ? "message_room" : "private_message";
    socket.emit(eventName, message);
    resetField("text");
  };

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
      socket.emit("select_room", target.id, (messages: Message[]) => {
        setMessages(messages);
      });
      setValue("targetId", target.id);
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
          <>
            <div className="flex flex-col gap-5 w-full">
              <div className="navbar bg-slate-950 text-white rounded-lg">
                <a className="btn btn-ghost normal-case text-xl">
                  {target.name}
                </a>
                <button
                  className="btn text-white btn-error ml-auto"
                  onClick={() => setTarget(undefined)}
                >
                  Sair
                </button>
              </div>
              {messages.map((message, i) => (
                <ChatBubble
                  text={message.text}
                  user={message.user}
                  key={i}
                  position={
                    message.user.id === currentUser.id ? "end" : "start"
                  }
                />
              ))}
            </div>
            <form
              onSubmit={handleSubmit(sendMessage)}
              className="self-end px-5 w-full flex gap-3"
            >
              <input
                type="text"
                placeholder="Type here"
                className="input input-bordered input-accent w-full "
                {...register("text")}
              />
              <button type="submit" className="btn btn-secondary text-white">
                Enviar
              </button>
            </form>
          </>
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
