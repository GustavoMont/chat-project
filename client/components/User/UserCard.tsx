import { User } from "@/models/User";
import React from "react";

interface Props {
  user: User;
  onClick: (user: User) => void;
}

export const UserCard: React.FC<Props> = ({ user, onClick }) => {
  const handleClick = () => {
    onClick(user);
  };
  return (
    <div
      className="bg-white transition-all duration-150 ease-in-out p-4 rounded shadow cursor-pointer hover:bg-slate-400 active:scale-[0.90] active:bg-slate-700 active:text-white"
      onClick={handleClick}
    >
      <h3 className="text-lg font-medium">{user.name}</h3>
    </div>
  );
};
