import { Request, Response, Router } from "express";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { Usuario } from "../modelos/Usuario";
import * as bcrypt from "bcrypt";
import { authJwt, authLocal } from "../services/autenticacao";
import passport from "passport";
import { createJwt } from "../services/usuarios-servicos";

const rotaUsuario = Router();

const usuariosRef = collection(db, "usuarios");

const mostrarUsuarioPeloUsername = async (username: string) => {
  const usuarioConsulta = query(usuariosRef, where("username", "==", username));
  const resultado = await getDocs(usuarioConsulta);
  if (resultado.docs.length === 0) {
    return null;
  }
  const usuario = resultado.docs[0].data();
  return usuario;
};

rotaUsuario.post("/", async (req, res: Response) => {
  try {
    const body: Usuario = req.body;
    const usuarioExiste = await mostrarUsuarioPeloUsername(body.username);
    if (usuarioExiste) {
      return res.status(400).json({ mensagem: "usuário já cadastrado" });
    }
    const docRef = await addDoc(usuariosRef, {
      nome: body.nome,
      username: body.username,
      senha: await bcrypt.hash(body.senha, 10),
    });
    return res.status(201).json({ mensagem: `usuário ${docRef.id} criado` });
  } catch (e) {
    console.log(e);

    return res.status(400).json({ mensagem: "erro ao criar usuário" });
  }
});

rotaUsuario.post(
  "/login",
  authLocal,
  async (req: Request, res: Response, next) => {
    try {
      const user = req.user;
      if (user) {
        res.status(200).json({
          access: createJwt(user.id),
        });
      }
      return next();
    } catch (error) {
      console.log(error);

      res.status(500).json({ mensagem: "ocorreu um erro" });
    }
  }
);

rotaUsuario.get("/:username/secret", authJwt, async (req, res) => {
  return res.status(200).json({ secret: "route" });
});

rotaUsuario.get("/:username", async (req: Request, res: Response) => {
  try {
    const usuario = await mostrarUsuarioPeloUsername(req.params.username);
    if (!usuario) {
      return res.status(404).json({ mensagem: "usuário não encontrado" });
    }
    usuario.senha = undefined;
    return res.json({ ...usuario });
  } catch (error) {
    console.log(error?.toString());

    return res.status(500).json({ mensagem: "ocorreu um erro" });
  }
});

export default rotaUsuario;
