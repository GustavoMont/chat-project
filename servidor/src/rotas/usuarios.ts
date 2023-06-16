import { Request, Response, Router } from "express";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Usuario } from "../modelos/Usuario";
import * as bcrypt from "bcrypt";

const rotaUsuario = Router();

rotaUsuario.post("/", async (req: Request, res: Response) => {
  try {
    const body: Usuario = req.body;
    const docRef = await addDoc(collection(db, "usuarios"), {
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

export default rotaUsuario;
