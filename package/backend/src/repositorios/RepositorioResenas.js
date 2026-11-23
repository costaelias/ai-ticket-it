import RepositorioEnMemoria from "./RepositorioEnMemoria.js";

/** @extends {RepositorioEnMemoria<import("../dominio/Resena.js").default>} */
export default class RepositorioResenas extends RepositorioEnMemoria {
  constructor({ almacen = new Map() } = {}) {
    super({ almacen, entidad: "Reseña" });
  }

  async listarPorOrganizador(organizadorId) {
    return (await this.listar()).filter(resena => resena.evento.organizador.id === organizadorId);
  }
}
