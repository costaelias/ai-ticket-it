import RepositorioEnMemoria from "./RepositorioEnMemoria.js";

export default class RepositorioCompras extends RepositorioEnMemoria {
  constructor({ almacen = new Map() } = {}) {
    super({ almacen, entidad: "Compra" });
  }

  async listarPorComprador(compradorId) {
    return (await this.listar()).filter(compra => compra.comprador.id === compradorId);
  }

  async listarPorEvento(eventoId) {
    return (await this.listar()).filter(compra => compra.evento.id === eventoId);
  }

  async listarPorParticipante(usuario) {
    return (await this.listar()).filter(compra => compra.esParticipante(usuario));
  }
}
