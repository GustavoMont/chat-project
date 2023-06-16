import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { socket } from "@/services/socket";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [isConnected, setIsConnected] = useState(socket.connected);
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
    <main
      className={`flex h-screen flex-col items-center justify-center gap-4 ${inter.className}`}
    >
      <h1>Estou {isConnected ? "conectado" : "desconectado"}</h1>
      <div className="flex gap-4">
        <button onClick={connect} className="btn btn-success">
          Conectar
        </button>
        <button onClick={disconnect} className="btn btn-error">
          Desconectar
        </button>
      </div>
    </main>
  );
}
