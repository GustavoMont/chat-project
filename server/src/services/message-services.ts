import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { getUserById } from "./user-services";
import { Message } from "../models/Message";
import { User } from "../models/User";

export const messagesRef = collection(db, "messages");

export const addMessage = async (message: Message) => {
  const messageDoc = await addDoc(messagesRef, {
    userId: message.user.id,
    text: message.text,
    date: new Date(),
    targetId: message.targetId,
  });
  return {
    ...message,
    id: messageDoc.id,
  };
};

export const getRoomMessages = async (roomId: string) => {
  const roomMessagesQuery = query(messagesRef, where("targetId", "==", roomId));
  const result = await getDocs(roomMessagesQuery);
  let user: User | undefined;
  const messages = await Promise.all(
    result.docs.map(async (message) => {
      const messageData = message.data() as Message;
      if (!user) {
        user = await getUserById(messageData.userId);
      }
      return {
        ...messageData,
        id: message.id,
        user,
      };
    })
  );
  return messages;
};

export const getPrivateMessage = async (userId: string, targetId: string) => {
  const user = await getUserById(userId);
  const targetUser = await getUserById(targetId);
  const userMessagesQuery = query(
    messagesRef,
    where("userId", "==", userId),
    where("targetId", "==", targetId)
  );
  const targetMessagesQuery = query(
    messagesRef,
    where("userId", "==", targetId),
    where("targetId", "==", userId)
  );
  const userResult = await getDocs(userMessagesQuery);
  const targetResult = await getDocs(targetMessagesQuery);
  const userMessages: Message[] = userResult.docs.map((message) => ({
    ...(message.data() as Message),
    id: message.id,
    user,
  }));
  const targetMessages: Message[] = targetResult.docs.map((message) => ({
    ...(message.data() as Message),
    id: message.id,
    user: targetUser,
  }));

  const allMessages: Message[] = userMessages.concat(targetMessages);
  return allMessages.sort(
    (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
  );
};
