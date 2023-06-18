import { CtxType } from "@/types/Ctx";
import axios from "axios";
import { getToken } from "./auth";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const serverSideAPi = (ctx: CtxType | null) => {
  const token = getToken(ctx);
  api.defaults.headers["Authorization"] = `Bearer ${token}`;

  return api;
};
