import { collection, getDocs, query, where } from "firebase/firestore";
import * as jwt from "jsonwebtoken";
import { db } from "../config/firebase";
import { constants } from "../constants";

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

export const createJwt = (id: string) => {
  return jwt.sign(
    {
      id,
    },
    constants.jwtKey
  );
};
