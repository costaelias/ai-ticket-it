import RepositorioEnMemoria from "./RepositorioEnMemoria.js";

/** @extends {RepositorioEnMemoria<import("../dominio/Usuario.js").default>} */
export default class RepositorioUsuarios extends RepositorioEnMemoria {
  constructor({ almacen = new Map() } = {}) {
    super({ almacen, entidad: "Usuario" });
  }

  async buscarPorCorreo(correo) {
    const buscado = String(correo ?? "").trim().toLowerCase();
    return (await this.listar()).find(usuario => usuario.correo === buscado) ?? null;
  }
}
