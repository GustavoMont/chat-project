import { User as MyUser } from "../modelos/User";

declare global {
  namespace Express {
    export interface User extends MyUser {}
  }
}
