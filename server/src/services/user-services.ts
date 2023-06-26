import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import * as jwt from "jsonwebtoken";
import { db } from "../config/firebase";
import { constants } from "../constants";
import { User } from "../models/User";

export const usersRef = collection(db, "users");

export const getUserByUsername = async (username: string) => {
  const useQuery = query(usersRef, where("username", "==", username));
  const result = await getDocs(useQuery);
  if (result.docs.length === 0) {
    return null;
  }

  const user = result.docs[0].data();
  user.id = result.docs[0].id;
  return user;
};

export const getUserDoc = (id: string) => doc(db, "users", id);

export const getUserById = async (
  id: string,
  getPassword: boolean = false
): Promise<User> => {
  const userDoc = await getDoc(getUserDoc(id));
  const userData = userDoc.data() as User;

  if (!getPassword && userData) {
    userData.password = undefined;
  }
  return {
    ...userData,
    id: userDoc.id,
  };
};

interface JwtPayload {
  id: string;
}

export const createJwt = (payload: JwtPayload) => {
  return jwt.sign(payload, constants.jwtKey);
};
