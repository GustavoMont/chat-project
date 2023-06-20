import { User } from "./User";

export interface Message {
  text: string;
  targetId: string;
  date: Date;
  user: User;
  userId: string;
}
