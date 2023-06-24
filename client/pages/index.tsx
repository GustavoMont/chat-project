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

const inter = Inter({ subsets: ["latin"] });

interface Message {
  text: string;
  targetId: string;
  date: Date;
  user: User;
}

interface Props {
  rooms: Room[];
  currentUser: User;
}

interface OnlineUser extends User {
  socketId: string;
}

export default function Home({ rooms, currentUser }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<Room>();
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const tabs = [
    {
      title: "Salas",
      content: (
        <RoomsList rooms={rooms} onSelect={(room) => setSelectedRoom(room)} />
      ),
    },
    {
      title: "Usuários",
      content: (
        <UsersList users={users} onSelect={(user) => setSelectedRoom(user)} />
      ),
    },
  ];

  const { register, setValue, handleSubmit, resetField } = useForm<Message>({
    defaultValues: {
      user: currentUser,
    },
  });

  const sendMessage = (message: Message) => {
    socket.emit("message_room", message);
    resetField("text");
  };

  useEffect(() => {
    socket.connect();
    socket.emit("turn_online", currentUser);
    socket.on("message_room", (newMessage: Message) => {
      setMessages((messages) => [...messages, newMessage]);
    });
    socket.on("get_users", (users) => {
      setUsers(users);
    });

    return () => {
      socket.disconnect();
      socket.emit("leave");
      socket.off("message_room");
    };
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      socket.emit("select_room", selectedRoom.id, (messages: Message[]) => {
        setMessages(messages);
      });
      setValue("targetId", selectedRoom.id);
    } else {
      socket.emit("leave");
    }
    setMessages([]);
  }, [selectedRoom]);

  return (
    <main className={`flex p-5 gap-5 h-screen ${inter.className}`}>
      <div className="flex flex-col gap-5 w-1/2 max-h-screen">
        <Tabs tabs={tabs} />
      </div>
      <div
        className={`flex flex-wrap w-full h-full px-5 py-5 rounded-lg ${
          selectedRoom ? "" : "justify-center items-center"
        }`}
      >
        {selectedRoom ? (
          <>
            <div className="flex flex-col gap-5 w-full">
              <div className="navbar bg-slate-950 text-white rounded-lg">
                <a className="btn btn-ghost normal-case text-xl">
                  {selectedRoom.name}
                </a>
                <button
                  className="btn text-white btn-error ml-auto"
                  onClick={() => setSelectedRoom(undefined)}
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
