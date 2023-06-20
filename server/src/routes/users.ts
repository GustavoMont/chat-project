import { Request, Response, Router } from "express";
import { addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { User } from "../models/User";
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
      role: body?.role || "aventureiro",
    });
    return res.status(201).json({ access: createJwt({ id: docRef.id }) });
  } catch (e) {
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
          access: createJwt({ id: user.id }),
        });
      }
      return next();
    } catch (error) {
      res.status(500).json({ mensagem: "ocorreu um erro" });
    }
  }
);

userRoutes.get("/me", authJwt, async (req, res) => {
  try {
    return res.json(req.user);
  } catch (error) {
    return res.status(500).json({ message: "Ocorreu um erro" });
  }
});

export default userRoutes;
