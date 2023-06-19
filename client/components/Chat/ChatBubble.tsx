import React from "react";

interface Props {
  text: string;
  user: User;
  position?: "end" | "start";
}

export const ChatBubble: React.FC<Props> = ({
  text,
  position = "start",
  user,
}) => {
  return (
    <div className={`chat ${position === "start" ? "chat-start" : "chat-end"}`}>
      <div className="chat-header">{user.name}</div>
      <div className="chat-bubble">{text}</div>
    </div>
  );
};
