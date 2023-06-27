import { User } from "./User";

export interface Message {
  id: string;
  text: string;
  targetId: string;
  date: Date;
  user: User;
}
