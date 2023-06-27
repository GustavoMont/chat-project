import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/services/socket";
import { GetServerSideProps } from "next";
import { getToken } from "@/services/auth";
import { api, serverSideAPi } from "@/services/api";
import { Room } from "@/models/Room";
import Tabs from "@/components/Common/Tabs";
import { User } from "@/models/User";
import { UsersList } from "@/components/User/UsersList";
import { RoomsList } from "@/components/Room/RoomsList";
import { Target } from "@/models/Target";
import { ChatContainer } from "@/components/Chat/ChatContainer";
import { Avatar } from "@/components/User/Avatar";
import { Modal } from "@/components/Common/Modal";
import { useForm } from "react-hook-form";
import { Message } from "@/models/Message";

const inter = Inter({ subsets: ["latin"] });

interface Props {
  rooms: Room[];
  currentUser: User;
}

interface OnlineUser extends User {
  socketId: string;
}

export default function Home({ rooms, currentUser }: Props) {
  const [target, setTarget] = useState<Target>();
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [user, setUser] = useState<User>(currentUser);
  interface UpdateUser {
    name: string;
    avatar?: FileList;
  }
  const { register, handleSubmit } = useForm<UpdateUser>({
    defaultValues: {
      name: user.name,
    },
  });
  const closeModal = () => setOpenModal(false);
  const updateUser = async (data: UpdateUser) => {
    const avatar = data.avatar?.item(0);
    const { data: updatedUser } = await api.patch<User>(
      `users/${user.id}`,
      {
        ...data,
        avatar,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      }
    );
    setUser(updatedUser);
    closeModal();
  };
  const tabs = [
    {
      title: "Salas",
      content: (
        <RoomsList
          rooms={rooms}
          onSelect={({ id, name }) =>
            setTarget({
              id,
              name,
              type: "room",
            })
          }
        />
      ),
    },
    {
      title: "Usuários",
      content: (
        <UsersList
          currentUser={user}
          users={users}
          onSelect={({ id, name }) =>
            setTarget({
              id,
              name,
              type: "user",
            })
          }
        />
      ),
    },
  ];

  useEffect(() => {
    Notification.requestPermission();
  }, []);

  useEffect(() => {
    const getRoomMessages = (newMessage: Message) => {
      setMessages((messages) => [...messages, newMessage]);
    };
    const getOnlineUsers = (users: OnlineUser[]) => {
      setUsers(users);
    };
    const getPrivateMessge = (newMessage: Message) => {
      const shouldNotificate = newMessage.user.id !== target?.id;
      const isUserMessage = newMessage.user.id === user.id;
      if (target?.type === "room") {
        return;
      }
      if (isUserMessage || !shouldNotificate) {
        setMessages((oldMessages) => [...oldMessages, newMessage]);
      } else {
        if (Notification.permission === "granted") {
          new Notification(`Mensagem de ${newMessage.user.name}`, {
            body: newMessage.text,
            icon: newMessage.user.avatar,
          });
        }
      }
    };
    socket.auth = { id: user.id };
    socket.connect();
    socket.emit("turn_online", user);

    socket.on("message_room", getRoomMessages);
    socket.on("get_users", getOnlineUsers);
    socket.on("private_message", getPrivateMessge);

    return () => {
      socket.disconnect();
      socket.off("message_room", getRoomMessages);
      socket.off("private_message", getPrivateMessge);
      socket.off("get_users", getOnlineUsers);
    };
  }, []);

  useEffect(() => {
    setMessages([]);
    if (target) {
      const eventName = target.type === "room" ? "select_room" : "select_user";
      socket.emit(eventName, target.id, (messages: Message[]) => {
        setMessages(messages);
      });
    } else {
      socket.emit("leave");
    }
  }, [target]);

  return (
    <main className={`flex p-5 gap-5 h-screen ${inter.className}`}>
      <div className="flex flex-col gap-5 w-1/2 max-h-screen">
        <div className="navbar bg-slate-950 text-white rounded-lg px-5">
          <div className="flex gap-5 items-center">
            <div
              onClick={() => setOpenModal(true)}
              className="active:scale-90 cursor-pointer hover:opacity-80"
            >
              <Avatar name={user.name} avatar={user.avatar} />
            </div>
            <span className="font-bold">{user.name}</span>
          </div>
        </div>
        <Tabs tabs={tabs} />
      </div>
      <div
        className={`flex flex-wrap w-full h-full px-5 rounded-lg ${
          target ? "" : "justify-center items-center"
        }`}
      >
        {target ? (
          <ChatContainer
            currentUser={user}
            messages={messages}
            onGetOut={() => setTarget(undefined)}
            target={target}
          />
        ) : (
          <button className="btn btn-primary" disabled>
            <h2 className="text-center text-lg font-bold text-slate-800">
              Nenhuma sala selecionada
            </h2>
          </button>
        )}
      </div>
      <Modal active={openModal} title="Alterar informações">
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit(updateUser)}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 tracking-wide">
              Nome:
            </label>
            <input
              className=" w-full text-base px-4 py-2 border  border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
              type="text"
              placeholder="Nome"
              {...register("name")}
            />
          </div>
          <div className="form-control w-full ">
            <label className="label">
              <span className="label-text">Foto</span>
            </label>
            <input
              {...register("avatar")}
              type="file"
              className="file-input file-input-bordered w-full"
            />
          </div>
          <div className="flex gap-5 items-center justify-center mt-5 ">
            <button
              type="reset"
              onClick={closeModal}
              className="btn btn-neutral w-2/5"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary w-2/5">
              Atualizar
            </button>
          </div>
        </form>
      </Modal>
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
  const { data: currentUser } = await serverSideAPi(ctx).get<User>("/users/me");

  return {
    props: {
      rooms,
      currentUser,
    },
  };
};
