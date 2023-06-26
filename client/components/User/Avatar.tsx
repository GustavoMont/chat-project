import React from "react";

interface Props {
  avatar?: string;
  name: string;
}

export const Avatar: React.FC<Props> = ({ avatar, name }) => {
  return (
    <div className="avatar placeholder">
      <div className="bg-secondary text-neutral-content rounded-full w-10">
        {avatar ? (
          <img src={avatar} alt={`Avatar do ${name}`} />
        ) : (
          <span className="text-3xl">{name[0]}</span>
        )}
      </div>
    </div>
  );
};
