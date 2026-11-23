import { BadRequest } from "./errores.js";
import { normalizarTexto, textoRequerido } from "./validaciones.js";

export default class Categoria {
  constructor(nombre, descripcion) {
    this.nombre = textoRequerido(nombre, "El nombre de la categoría", { max: 60 });
    this.descripcion = textoRequerido(descripcion, "La descripción de la categoría", { max: 200 });
  }

  static todas() {
    return CATEGORIAS;
  }

  static deNombre(nombre) {
    const buscada = normalizarTexto(nombre);
    const categoria = CATEGORIAS.find(candidata => normalizarTexto(candidata.nombre) === buscada);
    if (!categoria) {
      const validas = CATEGORIAS.map(candidata => candidata.nombre).join(", ");
      throw new BadRequest(`La categoría no es válida. Opciones: ${validas}.`);
    }
    return categoria;
  }

  coincideCon(texto) {
    return normalizarTexto(this.nombre) === normalizarTexto(texto);
  }

  toJSON() {
    return { nombre: this.nombre, descripcion: this.descripcion };
  }
}

const CATEGORIAS = Object.freeze([
  new Categoria("Música", "Recitales, shows en vivo y ciclos musicales."),
  new Categoria("Teatro", "Obras, musicales y espectáculos escénicos."),
  new Categoria("Deportes", "Partidos, torneos y competencias."),
  new Categoria("Conferencias", "Charlas, congresos y encuentros profesionales."),
  new Categoria("Festivales", "Eventos de varios días con múltiples propuestas."),
  new Categoria("Gastronomía", "Ferias, degustaciones y experiencias culinarias.")
]);
