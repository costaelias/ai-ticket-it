import { randomUUID } from "node:crypto";
import Usuario from "./Usuario.js";
import { fechaValida, instanciaDe, textoRequerido } from "./validaciones.js";

export default class Mensaje {
  constructor({ id = randomUUID(), usuario, mensaje, enviado } = {}) {
    this.id = textoRequerido(id, "El id del mensaje");
    this.usuario = instanciaDe(usuario, Usuario, "El autor del mensaje");
    this.mensaje = textoRequerido(mensaje, "El mensaje", { max: 1000 });
    this.enviado = fechaValida(enviado, "La fecha del mensaje");
  }

  toJSON() {
    return {
      id: this.id,
      usuario: { ...this.usuario.resumen(), rol: this.usuario.rol },
      mensaje: this.mensaje,
      enviado: this.enviado
    };
  }
}
