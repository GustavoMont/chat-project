import passport from "passport";
import { IStrategyOptions, Strategy } from "passport-local";
import { getUserById, getUserByUsername } from "./user-services";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import * as bcrypt from "bcrypt";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { constants } from "../constants";
import { User } from "../models/User";
import { NextFunction, Request, Response } from "express";

const opcoes: IStrategyOptions = {
  usernameField: "username",
  session: false,
};

const local = new Strategy(opcoes, async (username, senha, done) => {
  try {
    const user = (await getUserByUsername(username)) as User;

    if (user === null) {
      return done(null, false);
    }
    const isPasswordCorrect = await bcrypt.compare(senha, user.password || "");
    if (!isPasswordCorrect) {
      return done(null, false);
    }
    user.password = undefined;
    return done(null, { ...user, id: user.id });
  } catch (e) {
    return done(e, false);
  }
});

export const userHasPermission =
  (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!roles.includes(user?.role || "")) {
      return res.status(403).json({ mensagem: "você não tem permissão" });
    }
    return next();
  };

const jwtOpcoes = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: constants.jwtKey,
  ignoreExpiration: false,
};
const jwt = new JwtStrategy(jwtOpcoes, async (payload, done) => {
  try {
    //Identify user by ID
    const user = await getUserById(payload.id);

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (e) {
    return done(e, false);
  }
});

passport.use(local);
passport.use(jwt);

export const authLocal = passport.authenticate("local", {
  session: false,
});

export const authJwt = passport.authenticate("jwt", {
  session: false,
});
