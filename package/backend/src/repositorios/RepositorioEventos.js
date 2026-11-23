import RepositorioEnMemoria from "./RepositorioEnMemoria.js";

/** @extends {RepositorioEnMemoria<import("../dominio/Evento.js").default>} */
export default class RepositorioEventos extends RepositorioEnMemoria {
  constructor({ almacen = new Map() } = {}) {
    super({ almacen, entidad: "Evento" });
  }

  async listarPorOrganizador(organizadorId) {
    return (await this.listar()).filter(evento => evento.organizador.id === organizadorId);
  }
}
