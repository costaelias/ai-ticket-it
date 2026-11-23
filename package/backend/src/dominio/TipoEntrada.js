import { randomUUID } from "node:crypto";
import { Conflict } from "./errores.js";
import { enteroEnRango, numeroEnRango, textoOpcional, textoRequerido } from "./validaciones.js";

export default class TipoEntrada {
  constructor({ id = randomUUID(), nombre, descripcion = "", precio, cupo, vendidas = 0 } = {}) {
    this.id = textoRequerido(id, "El id del tipo de entrada");
    this.nombre = textoRequerido(nombre, "El nombre del tipo de entrada", { max: 60 });
    this.descripcion = textoOpcional(descripcion, "La descripción del tipo de entrada", { max: 200 });
    this.precio = numeroEnRango(precio, `El precio de "${this.nombre}"`, { min: 0, max: 10_000_000 });
    this.cupo = enteroEnRango(cupo, `El cupo de "${this.nombre}"`, { min: 1, max: 1_000_000 });
    this.vendidas = enteroEnRango(vendidas, "Las entradas vendidas", { min: 0, max: this.cupo });
  }

  disponibles() {
    return this.cupo - this.vendidas;
  }

  hayCupoPara(cantidad) {
    return cantidad <= this.disponibles();
  }

  reservar(cantidad) {
    if (!this.hayCupoPara(cantidad)) {
      throw new Conflict(
        `No hay cupo suficiente para "${this.nombre}": quedan ${this.disponibles()} entradas disponibles.`
      );
    }
    this.vendidas += cantidad;
  }

  liberar(cantidad) {
    this.vendidas = Math.max(0, this.vendidas - cantidad);
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      cupo: this.cupo,
      vendidas: this.vendidas,
      disponibles: this.disponibles()
    };
  }
}
