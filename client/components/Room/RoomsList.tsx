import { Room } from "@/models/Room";
import React from "react";
import { RoomCard } from "./RoomCard";

interface Props {
  rooms: Room[];
  onSelect(room: Room): void;
}

export const RoomsList: React.FC<Props> = ({ onSelect, rooms }) => {
  return (
    <div className="flex flex-col gap-5 overflow-y-auto">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onClick={() => onSelect(room)} />
      ))}
    </div>
  );
};
