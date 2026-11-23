import Catalogo from "../dominio/Catalogo.js";
import Categoria from "../dominio/Categoria.js";
import Evento from "../dominio/Evento.js";
import Reputacion from "../dominio/Reputacion.js";
import { RolUsuario } from "../dominio/enums.js";
import RepositorioCompras from "../repositorios/RepositorioCompras.js";
import RepositorioEventos from "../repositorios/RepositorioEventos.js";
import RepositorioResenas from "../repositorios/RepositorioResenas.js";
import RepositorioUsuarios from "../repositorios/RepositorioUsuarios.js";

export default class ServicioEventos {
  constructor({
    repositorioEventos = new RepositorioEventos(),
    repositorioUsuarios = new RepositorioUsuarios(),
    repositorioCompras = new RepositorioCompras(),
    repositorioResenas = new RepositorioResenas(),
    fecha = () => new Date()
  } = {}) {
    this.repositorioEventos = repositorioEventos;
    this.repositorioUsuarios = repositorioUsuarios;
    this.repositorioCompras = repositorioCompras;
    this.repositorioResenas = repositorioResenas;
    this.fecha = fecha;
  }

  async listarCategorias() {
    return { categorias: Categoria.todas().map(categoria => categoria.toJSON()) };
  }

  async buscar(usuarioId, filtros) {
    const usuario = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    const resenas = await this.repositorioResenas.listar();
    const catalogo = new Catalogo({ eventos: await this.repositorioEventos.listar(), resenas });
    const eventos = catalogo.buscar(filtros, this.fecha());
    return {
      eventos: eventos.map(evento => evento.resumen({
        reputacion: catalogo.reputacionDe(evento.organizador),
        esFavorito: usuario.esFavorito(evento)
      }))
    };
  }

  async obtener(usuarioId, eventoId) {
    const usuario = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    const evento = await this.repositorioEventos.obtenerPorId(eventoId);
    return { evento: evento.detalle({ reputacion: await this.#reputacionDe(evento), esFavorito: usuario.esFavorito(evento) }) };
  }

  async publicar(usuarioId, datos) {
    const organizador = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    const evento = Evento.publicar({ ...datos, organizador }, this.fecha());
    await this.repositorioEventos.guardar(evento);
    return { evento: evento.detalle({ reputacion: await this.#reputacionDe(evento) }) };
  }

  async listarOrganizados(usuarioId) {
    const organizador = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    organizador.exigirRol(RolUsuario.ORGANIZADOR);
    const reputacion = new Reputacion(await this.repositorioResenas.listarPorOrganizador(organizador.id));
    const eventos = await this.repositorioEventos.listarPorOrganizador(organizador.id);
    return { eventos: eventos.map(evento => evento.resumen({ reputacion })) };
  }

  async listarComprasDeEvento(usuarioId, eventoId) {
    const organizador = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    const evento = await this.repositorioEventos.obtenerPorId(eventoId);
    evento.exigirOrganizador(organizador);
    const ahora = this.fecha();
    const compras = await this.repositorioCompras.listarPorEvento(evento.id);
    return {
      evento: evento.resumen({ reputacion: await this.#reputacionDe(evento) }),
      compras: compras.map(compra => compra.resumen(ahora))
    };
  }

  async #reputacionDe(evento) {
    return new Reputacion(await this.repositorioResenas.listarPorOrganizador(evento.organizador.id));
  }
}
