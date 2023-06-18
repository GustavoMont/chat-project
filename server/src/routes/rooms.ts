import { Router } from "express";
import { authJwt, userHasPermission } from "../services/auth";
import { Room } from "../models/Room";
import { addDoc, getDocs } from "firebase/firestore";
import { roomsRef } from "../services/rooms-services";

const roomsRoute = Router();

roomsRoute.post(
  "/",
  authJwt,
  userHasPermission(["taberneiro"]),
  async (req, res) => {
    const body: Room = req.body;
    const docRef = await addDoc(roomsRef, {
      name: body.name,
    });

    return res.status(201).json({
      id: docRef.id,
      mensage: "sala criada",
    });
  }
);

roomsRoute.get("/", authJwt, async (req, res) => {
  try {
    const roomsDoc = await getDocs(roomsRef);
    const rooms = roomsDoc.docs.map((roomDoc) => ({
      id: roomDoc.id,
      ...roomDoc.data(),
    }));
    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(500).json({ message: "Ocorreu um erro" });
  }
});

export default roomsRoute;
