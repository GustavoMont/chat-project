import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { socket } from "@/services/socket";
import { GetServerSideProps } from "next";
import { getToken } from "@/services/auth";
import { serverSideAPi } from "@/services/api";
import { Room } from "@/models/Room";
import { RoomCard } from "@/components/Room/RoomCard";
import { useForm } from "react-hook-form";

const inter = Inter({ subsets: ["latin"] });

interface Props {
  rooms: Room[];
}

export default function Home({ rooms }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<Room>();
  interface Message {
    text: string;
    roomId: string;
    date: Date;
  }
  const { register, setValue, handleSubmit, reset } = useForm<Message>();

  const sendMessage = (message: Message) => {
    socket.emit("message", message);
    reset();
  };

  useEffect(() => {
    socket.connect();

    socket.on("message", (data) => {
      console.log(data);
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
  }, [selectedRoom]);

  return (
    <main className="flex p-5 gap-5 h-screen">
      <div className="flex flex-col gap-5 w-1/2 max-h-screen">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={() => setSelectedRoom(room)}
          />
        ))}
      </div>
      <div className="flex flex-wrap w-full h-full">
        <div className="flex flex-col gap-5 w-full">
          {selectedRoom && (
            <button
              className="btn btn-error"
              onClick={() => setSelectedRoom(undefined)}
            >
              Sair da sala
            </button>
          )}
          <p className="font-bold text-lg">
            {selectedRoom
              ? `Conectado na sala: ${selectedRoom.name}`
              : "Nenhuma sala conectada"}
          </p>
        </div>
        {selectedRoom && (
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

  return {
    props: {
      rooms,
    },
  };
};
