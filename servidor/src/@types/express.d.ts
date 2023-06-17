import { Usuario } from "../modelos/Usuario";

declare global {
  namespace Express {
    export interface User extends Usuario {}
  }
}
