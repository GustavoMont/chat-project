import { NextApiRequest, NextPageContext } from "next";
import { setCookie, parseCookies } from "nookies";

export const tokenKey = "@access";

export const saveToken = (token: string) => {
  setCookie(null, tokenKey, token);
};

type ContextType =
  | Pick<NextPageContext, "req">
  | {
      req: NextApiRequest;
    }
  | {
      req: Request;
    }
  | null
  | undefined;

export const getToken = (ctx: ContextType = null) => {
  const { [tokenKey]: token } = parseCookies(ctx);
  return token;
};
