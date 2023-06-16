import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const usuariosRef = collection(db, "usuarios");

export const mostrarUsuarioPeloUsername = async (username: string) => {
  const usuarioConsulta = query(usuariosRef, where("username", "==", username));
  const resultado = await getDocs(usuarioConsulta);
  if (resultado.docs.length === 0) {
    return null;
  }

  const usuario = resultado.docs[0].data();
  usuario.id = resultado.docs[0].id;
  return usuario;
};
