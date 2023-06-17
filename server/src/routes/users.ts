import { Request, Response, Router } from "express";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { User } from "../modelos/User";
import * as bcrypt from "bcrypt";
import { authJwt, authLocal } from "../services/auth";
import {
  createJwt,
  getUserByUsername,
  usersRef,
} from "../services/user-services";

const userRoutes = Router();

userRoutes.post("/", async (req, res: Response) => {
  try {
    const body: User = req.body;
    const userExists = await getUserByUsername(body.username);
    if (userExists) {
      return res.status(400).json({ mensagem: "usuário já cadastrado" });
    }
    const docRef = await addDoc(usersRef, {
      name: body.name,
      username: body.username,
      password: await bcrypt.hash(body.password || "", 10),
    });
    return res.status(201).json({ access: createJwt(docRef.id) });
  } catch (e) {
    console.log(e);

    return res.status(400).json({ mensagem: "erro ao criar usuário" });
  }
});

userRoutes.post(
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

userRoutes.get("/:username/secret", authJwt, async (req, res) => {
  return res.status(200).json({ secret: "route" });
});

userRoutes.get("/:username", async (req: Request, res: Response) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ mensagem: "usuário não encontrado" });
    }
    user.password = undefined;
    return res.json({ ...user });
  } catch (error) {
    return res.status(500).json({ mensagem: "ocorreu um erro" });
  }
});

export default userRoutes;
