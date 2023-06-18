import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { socket } from "@/services/socket";
import { GetServerSideProps } from "next";
import { getToken } from "@/services/auth";
import { serverSideAPi } from "@/services/api";
import { Room } from "@/models/Room";
import { RoomCard } from "@/components/Room/RoomCard";

const inter = Inter({ subsets: ["latin"] });

interface Props {
  rooms: Room[];
}

export default function Home({ rooms }: Props) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [selectedRoom, setSelectedRoom] = useState<Room>();
  const connect = () => socket.connect();
  const disconnect = () => socket.disconnect();

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  return (
    <main className="flex p-5 gap-5">
      <div className="flex flex-col gap-5 w-1/2 max-h-screen">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={() => setSelectedRoom(room)}
          />
        ))}
      </div>
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
