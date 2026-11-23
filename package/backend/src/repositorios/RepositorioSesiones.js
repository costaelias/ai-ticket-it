import RepositorioEnMemoria from "./RepositorioEnMemoria.js";

/** @extends {RepositorioEnMemoria<import("../dominio/Sesion.js").default>} */
export default class RepositorioSesiones extends RepositorioEnMemoria {
  constructor({ almacen = new Map() } = {}) {
    super({ almacen, entidad: "Sesión" });
  }

  async guardar(sesion) {
    this.almacen.set(sesion.token, sesion);
    return sesion;
  }

  async buscarPorToken(token) {
    return this.buscarPorId(token);
  }

  async eliminar(token) {
    this.almacen.delete(token);
  }
}
