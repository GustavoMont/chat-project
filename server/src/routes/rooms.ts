import { Router } from "express";
import { authJwt, userHasPermission } from "../services/auth";
import { Room } from "../models/Room";
import { addDoc } from "firebase/firestore";
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

    return res.json({
      id: docRef.id,
      mensage: "sala criada",
    });
  }
);

export default roomsRoute;
