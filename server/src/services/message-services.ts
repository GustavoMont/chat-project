import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { getUserById } from "./user-services";
import { Message } from "../models/Message";

export const messagesRef = collection(db, "messages");

export const getRoomMessages = async (roomId: string) => {
  const roomMessagesQuery = query(messagesRef, where("targetId", "==", roomId));
  const result = await getDocs(roomMessagesQuery);
  const messages = await Promise.all(
    result.docs.map(async (message) => {
      const messageData = message.data() as Message;
      const user = await getUserById(messageData.userId);
      return {
        ...messageData,
        id: message.id,
        user,
      };
    })
  );
  return messages;
};
