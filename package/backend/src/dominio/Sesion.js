import { randomUUID } from "node:crypto";
import Usuario from "./Usuario.js";
import { BadRequest } from "./errores.js";
import { fechaValida, instanciaDe, textoRequerido } from "./validaciones.js";

export const DURACION_SESION_POR_DEFECTO_MS = 8 * 60 * 60 * 1000;

export default class Sesion {
  constructor({ token = randomUUID(), usuarioId, creada, expira } = {}) {
    this.token = textoRequerido(token, "El token de la sesión");
    this.usuarioId = textoRequerido(usuarioId, "El usuario de la sesión");
    this.creada = fechaValida(creada, "La fecha de creación de la sesión");
    this.expira = fechaValida(expira, "La fecha de expiración de la sesión");
    if (this.expira <= this.creada) {
      throw new BadRequest("La sesión debe expirar después de crearse.");
    }
  }

  // Factory Method: arma una sesión nueva a partir de un usuario y el momento de inicio.
  static iniciar(usuario, ahora, duracionMs = DURACION_SESION_POR_DEFECTO_MS) {
    instanciaDe(usuario, Usuario, "El usuario de la sesión");
    const creada = fechaValida(ahora, "La fecha de inicio de sesión");
    return new Sesion({ usuarioId: usuario.id, creada, expira: new Date(creada.getTime() + duracionMs) });
  }

  estaVigente(ahora) {
    return ahora < this.expira;
  }
}
