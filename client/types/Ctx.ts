import { NextApiRequest, NextPageContext } from "next";

export type CtxType =
  | Pick<NextPageContext, "req">
  | {
      req: NextApiRequest;
    }
  | {
      req: Request;
    }
  | null
  | undefined;
