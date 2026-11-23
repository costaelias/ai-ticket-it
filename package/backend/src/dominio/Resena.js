import { randomUUID } from "node:crypto";
import Evento from "./Evento.js";
import Usuario from "./Usuario.js";
import { BadRequest } from "./errores.js";
import { fechaValida, instanciaDe, numeroEnRango, textoRequerido } from "./validaciones.js";

export default class Resena {
  constructor({ id = randomUUID(), comprador, evento, detalle, puntuacion, fecha } = {}) {
    if (puntuacion === undefined || puntuacion === null) {
      throw new BadRequest("La puntuación es obligatoria.");
    }
    this.id = textoRequerido(id, "El id de la reseña");
    this.comprador = instanciaDe(comprador, Usuario, "El comprador de la reseña");
    this.evento = instanciaDe(evento, Evento, "El evento de la reseña");
    this.detalle = textoRequerido(detalle, "El comentario", { max: 1000 });
    this.puntuacion = numeroEnRango(puntuacion, "La puntuación", { min: 1, max: 5 });
    this.fecha = fechaValida(fecha, "La fecha de la reseña");
  }

  toJSON() {
    return {
      id: this.id,
      comprador: this.comprador.resumen(),
      evento: { id: this.evento.id, nombre: this.evento.nombre },
      puntuacion: this.puntuacion,
      detalle: this.detalle,
      fecha: this.fecha
    };
  }
}
