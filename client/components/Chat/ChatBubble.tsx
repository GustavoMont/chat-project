import React from "react";

interface Props {
  text: string;
}

export const ChatBubble: React.FC<Props> = ({ text }) => {
  return (
    <div className="chat chat-start">
      <div className="chat-bubble">{text}</div>
    </div>
  );
};
