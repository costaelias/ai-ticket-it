import { NotFound } from "../dominio/errores.js";

/**
 * Repositorio genérico sobre un Map en memoria, indexado por `id`.
 * Todas las operaciones son asincrónicas, igual que lo serían contra una base de datos.
 * @template T Entidad de dominio que guarda.
 */
export default class RepositorioEnMemoria {
  /** @param {{ almacen?: Map<string, T>, entidad?: string }} [opciones] */
  constructor({ almacen = new Map(), entidad = "Registro" } = {}) {
    /** @type {Map<string, T>} */
    this.almacen = almacen;
    this.entidad = entidad;
  }

  /**
   * @param {T} elemento
   * @returns {Promise<T>}
   */
  async guardar(elemento) {
    this.almacen.set(elemento.id, elemento);
    return elemento;
  }

  /** @returns {Promise<T | null>} */
  async buscarPorId(id) {
    return this.almacen.get(id) ?? null;
  }

  /**
   * @returns {Promise<T>}
   * @throws {NotFound} si no existe.
   */
  async obtenerPorId(id) {
    const elemento = await this.buscarPorId(id);
    if (!elemento) throw new NotFound(`${this.entidad} no encontrado.`);
    return elemento;
  }

  /** @returns {Promise<T[]>} */
  async listar() {
    return [...this.almacen.values()];
  }
}
