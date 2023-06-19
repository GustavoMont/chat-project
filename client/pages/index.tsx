import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { socket } from "@/services/socket";
import { GetServerSideProps } from "next";
import { getToken } from "@/services/auth";
import { serverSideAPi } from "@/services/api";
import { Room } from "@/models/Room";
import { RoomCard } from "@/components/Room/RoomCard";
import { useForm } from "react-hook-form";
import { ChatBubble } from "@/components/Chat/ChatBubble";

const inter = Inter({ subsets: ["latin"] });

interface Message {
  text: string;
  roomId: string;
  date: Date;
  user: User;
}

interface Props {
  rooms: Room[];
  currentUser: User;
}

export default function Home({ rooms, currentUser }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<Room>();
  const [messages, setMessages] = useState<Message[]>([]);

  const { register, setValue, handleSubmit, resetField } = useForm<Message>({
    defaultValues: {
      user: currentUser,
    },
  });

  const sendMessage = (message: Message) => {
    socket.emit("message", message);
    resetField("text");
  };

  useEffect(() => {
    socket.connect();

    socket.on("message", (newMessage: Message) => {
      setMessages((messages) => [...messages, newMessage]);
    });

    return () => {
      socket.disconnect();
      socket.emit("leave");
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      socket.emit("select_room", selectedRoom.id);
      setValue("roomId", selectedRoom.id);
    } else {
      socket.emit("leave");
    }
    setMessages([]);
  }, [selectedRoom]);

  return (
    <main className={`flex p-5 gap-5 h-screen ${inter.className}`}>
      <div className="flex flex-col gap-5 w-1/2 max-h-screen">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={() => setSelectedRoom(room)}
          />
        ))}
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
          <h2 className="text-center text-lg font-bold text-secondary">
            Nenhuma sala selecionada
          </h2>
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
