import passport from "passport";
import { IStrategyOptions, Strategy } from "passport-local";
import { mostrarUsuarioPeloUsername } from "./usuarios-servicos";
import * as bcrypt from "bcrypt";
import { Usuario } from "../modelos/Usuario";

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

passport.use(local);

export const authLocal = passport.authenticate("local", {
  session: false,
});
