import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { Forbidden, BadRequest } from "./errores.js";
import { RolUsuario } from "./enums.js";
import { listaDe, textoRequerido, valorDeEnum } from "./validaciones.js";

const LARGO_CLAVE_HASH = 32;

export default class Usuario {
  constructor({ id = randomUUID(), nombre, apellido, correo, claveHash, rol, favoritos = [] } = {}) {
    this.id = textoRequerido(id, "El id del usuario");
    this.nombre = textoRequerido(nombre, "El nombre", { max: 80 });
    this.apellido = textoRequerido(apellido, "El apellido", { max: 80 });
    this.correo = Usuario.#normalizarCorreo(correo);
    this.claveHash = textoRequerido(claveHash, "La clave", { max: 200 });
    this.rol = valorDeEnum(rol, RolUsuario, "El rol del usuario");
    this.favoritos = listaDe(favoritos, "Los favoritos");
  }

  // Factory Method: valida la clave en texto plano y guarda solo su hash.
  static crear({ nombre, apellido, correo, clave, rol }) {
    textoRequerido(clave, "La clave", { min: 6, max: 72 });
    return new Usuario({ nombre, apellido, correo, claveHash: Usuario.hashearClave(clave), rol });
  }

  static #normalizarCorreo(correo) {
    const normalizado = textoRequerido(correo, "El correo", { max: 254 }).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) {
      throw new BadRequest("El correo no tiene un formato válido.");
    }
    return normalizado;
  }

  static hashearClave(clave) {
    const sal = randomBytes(16).toString("hex");
    const hash = scryptSync(clave, sal, LARGO_CLAVE_HASH).toString("hex");
    return `${sal}:${hash}`;
  }

  verificarClave(clave) {
    if (typeof clave !== "string") return false;
    const [sal, hash] = this.claveHash.split(":");
    const esperado = Buffer.from(hash, "hex");
    const obtenido = scryptSync(clave, sal, LARGO_CLAVE_HASH);
    return timingSafeEqual(esperado, obtenido);
  }

  nombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  }

  esComprador() {
    return this.rol === RolUsuario.COMPRADOR;
  }

  esOrganizador() {
    return this.rol === RolUsuario.ORGANIZADOR;
  }

  exigirRol(rol) {
    if (this.rol !== rol) {
      throw new Forbidden(`Esta acción es exclusiva para el rol ${rol}.`);
    }
  }

  esFavorito(evento) {
    return this.favoritos.some(favorito => favorito.id === evento.id);
  }

  agregarFavorito(evento) {
    this.exigirRol(RolUsuario.COMPRADOR);
    if (!this.esFavorito(evento)) this.favoritos.push(evento);
  }

  quitarFavorito(evento) {
    this.exigirRol(RolUsuario.COMPRADOR);
    this.favoritos = this.favoritos.filter(favorito => favorito.id !== evento.id);
  }

  resumen() {
    return { id: this.id, nombre: this.nombre, apellido: this.apellido };
  }

  toJSON() {
    return { ...this.resumen(), correo: this.correo, rol: this.rol };
  }
}
