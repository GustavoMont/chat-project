import { User } from "./User";
import { Timestamp } from "firebase/firestore";

export interface Message {
  text: string;
  targetId: string;
  date: Timestamp;
  user: User;
  userId: string;
}
