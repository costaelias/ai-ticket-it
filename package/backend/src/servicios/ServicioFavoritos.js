import Reputacion from "../dominio/Reputacion.js";
import RepositorioEventos from "../repositorios/RepositorioEventos.js";
import RepositorioResenas from "../repositorios/RepositorioResenas.js";
import RepositorioUsuarios from "../repositorios/RepositorioUsuarios.js";

export default class ServicioFavoritos {
  constructor({
    repositorioUsuarios = new RepositorioUsuarios(),
    repositorioEventos = new RepositorioEventos(),
    repositorioResenas = new RepositorioResenas()
  } = {}) {
    this.repositorioUsuarios = repositorioUsuarios;
    this.repositorioEventos = repositorioEventos;
    this.repositorioResenas = repositorioResenas;
  }

  async listar(usuarioId) {
    const usuario = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    return { eventos: await Promise.all(usuario.favoritos.map(evento => this.#presentar(evento))) };
  }

  async agregar(usuarioId, eventoId) {
    const usuario = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    const evento = await this.repositorioEventos.obtenerPorId(eventoId);
    usuario.agregarFavorito(evento);
    await this.repositorioUsuarios.guardar(usuario);
    return { evento: await this.#presentar(evento) };
  }

  async quitar(usuarioId, eventoId) {
    const usuario = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    const evento = await this.repositorioEventos.obtenerPorId(eventoId);
    usuario.quitarFavorito(evento);
    await this.repositorioUsuarios.guardar(usuario);
    return { evento: evento.resumen({ reputacion: await this.#reputacionDe(evento), esFavorito: false }) };
  }

  async #presentar(evento) {
    return evento.resumen({ reputacion: await this.#reputacionDe(evento), esFavorito: true });
  }

  async #reputacionDe(evento) {
    return new Reputacion(await this.repositorioResenas.listarPorOrganizador(evento.organizador.id));
  }
}
