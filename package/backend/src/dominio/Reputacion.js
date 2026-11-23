import { listaDe } from "./validaciones.js";

export default class Reputacion {
  constructor(resenas = []) {
    this.resenas = listaDe(resenas, "Las reseñas");
  }

  cantidad() {
    return this.resenas.length;
  }

  promedio() {
    if (this.resenas.length === 0) return null;
    const suma = this.resenas.reduce((total, resena) => total + resena.puntuacion, 0);
    return Math.round((suma / this.resenas.length) * 10) / 10;
  }

  resumen() {
    return { puntaje: this.promedio(), cantidadResenas: this.cantidad() };
  }

  toJSON() {
    const recientes = [...this.resenas].sort((a, b) => b.fecha - a.fecha);
    return { ...this.resumen(), resenas: recientes.map(resena => resena.toJSON()) };
  }
}
