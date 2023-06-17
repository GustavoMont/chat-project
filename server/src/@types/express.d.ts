import { User as MyUser } from "../models/User";

declare global {
  namespace Express {
    export interface User extends MyUser {}
  }
}
