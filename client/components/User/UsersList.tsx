import { User } from "@/models/User";
import React from "react";
import { UserCard } from "./UserCard";

interface Props {
  users: User[];
  onSelect(user: User): void;
}

export const UsersList: React.FC<Props> = ({ users, onSelect }) => {
  return (
    <div className="flex flex-col gap-5 overflow-y-auto">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onClick={() => onSelect(user)} />
      ))}
    </div>
  );
};
