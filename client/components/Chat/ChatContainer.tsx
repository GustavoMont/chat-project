import { Message } from "postcss";
import React, { useEffect } from "react";
import { ChatBubble } from "./ChatBubble";
import { useForm } from "react-hook-form";
import { socket } from "@/services/socket";
import { Target } from "@/models/Target";
import { User } from "@/models/User";

interface Props {
  messages: Message[];
  onGetOut(): void;
  target: Target;
  currentUser: User;
}

export const ChatContainer: React.FC<Props> = ({
  messages,
  onGetOut,
  target,
  currentUser,
}) => {
  const { register, setValue, handleSubmit, resetField } = useForm<Message>({
    defaultValues: {
      user: currentUser,
    },
  });

  const sendMessage = (message: Message) => {
    const eventName =
      target?.type === "room" ? "message_room" : "private_message";
    socket.emit(eventName, message);
    resetField("text");
  };

  useEffect(() => {
    setValue("targetId", target.id);
  }, [target]);

  return (
    <>
      <div className="flex flex-col gap-5 w-full">
        <div className="navbar bg-slate-950 text-white rounded-lg">
          <a className="btn btn-ghost normal-case text-xl">{target.name}</a>
          <button
            className="btn text-white btn-error ml-auto"
            onClick={onGetOut}
          >
            Sair
          </button>
        </div>
        <div className="flex flex-col gap-5 overflow-y-auto pb-5 max-h-[75vh]">
          {messages.map((message, i) => (
            <ChatBubble
              text={message.text}
              user={message.user}
              key={i}
              position={message.user.id === currentUser.id ? "end" : "start"}
            />
          ))}
        </div>
      </div>
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
    </>
  );
};
