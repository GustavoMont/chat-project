import { Request, Response, Router } from "express";
import { addDoc, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../config/firebase";
import { User } from "../models/User";
import * as bcrypt from "bcrypt";
import { authJwt, authLocal } from "../services/auth";
import {
  createJwt,
  getUserById,
  getUserByUsername,
  getUserDoc,
  usersRef,
} from "../services/user-services";
import multer from "multer";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const userRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de tamanho do arquivo (5MB)
  },
});

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

userRoutes.patch("/:id", authJwt, upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.params.id;
    const { name } = req.body as { name: string };
    const photo = req.file;

    if (!name && !photo) {
      return res.status(400).json({ message: "Nenhum campo atualizado." });
    }
    const userRef = getUserDoc(userId);
    const updateData = {} as { name: string; avatar: string };
    if (photo) {
      const storageRef = ref(storage, `users/${userId}/photo`);

      await uploadBytes(storageRef, photo.buffer);

      const avatar = await getDownloadURL(storageRef);
      updateData.avatar = avatar;
      await updateDoc(userRef, updateData);
    }
    if (name) {
      updateData.name = name;
    }
    await updateDoc(userRef, updateData);
    const user = await getUserById(userId);
    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
});

export default userRoutes;
