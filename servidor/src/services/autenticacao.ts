import passport from "passport";
import { IStrategyOptions, Strategy } from "passport-local";
import { mostrarUsuarioPeloUsername } from "./usuarios-servicos";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import * as bcrypt from "bcrypt";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { constants } from "../constantes";

const opcoes: IStrategyOptions = {
  usernameField: "username",
  passwordField: "senha",
  session: false,
};

const local = new Strategy(opcoes, async (username, senha, done) => {
  try {
    const usuario = await mostrarUsuarioPeloUsername(username);

    if (!usuario) {
      return done(null, false);
    }
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return done(null, false);
    }
    usuario.senha = undefined;
    return done(null, usuario);
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
    const userDoc = await getDoc(doc(db, "usuarios", payload.id));
    const user = userDoc.data();

    if (!user) {
      return done(null, false);
    }
    user.senha = undefined;
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
