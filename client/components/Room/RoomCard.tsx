import { Room } from "@/models/Room";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  room: Room;
  onClick?(): void;
}

export const RoomCard: React.FC<Props> = ({ room, onClick }) => {
  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{room.name}</h2>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={onClick}>
            Entrar na sala
          </button>
        </div>
      </div>
    </div>
  );
};
