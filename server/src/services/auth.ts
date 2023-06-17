import passport from "passport";
import { IStrategyOptions, Strategy } from "passport-local";
import { getUserByUsername } from "./user-services";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import * as bcrypt from "bcrypt";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { constants } from "../constants";
import { User } from "../modelos/User";

const opcoes: IStrategyOptions = {
  usernameField: "username",
  passwordField: "senha",
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
    return done(null, user);
  } catch (e) {
    return done(e, false);
  }
});
const jwtOpcoes = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: constants.jwtKey,
  ignoreExpiration: false,
};
const jwt = new JwtStrategy(jwtOpcoes, async (payload, done) => {
  try {
    //Identify user by ID
    const userDoc = await getDoc(doc(db, "users", payload.id));
    const user = userDoc.data() as User;

    if (!user) {
      return done(null, false);
    }
    user.password = undefined;
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