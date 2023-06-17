import { collection } from "firebase/firestore";
import { db } from "../config/firebase";

export const roomsRef = collection(db, "rooms");
