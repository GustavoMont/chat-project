import { CtxType } from "@/types/Ctx";
import { NextApiRequest, NextPageContext } from "next";
import { setCookie, parseCookies } from "nookies";

export const tokenKey = "@access";

export const saveToken = (token: string) => {
  setCookie(null, tokenKey, token);
};

export const getToken = (ctx: CtxType = null) => {
  const { [tokenKey]: token } = parseCookies(ctx);
  return token;
};
