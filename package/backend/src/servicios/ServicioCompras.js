import Compra from "../dominio/Compra.js";
import { RolUsuario } from "../dominio/enums.js";
import RepositorioCompras from "../repositorios/RepositorioCompras.js";
import RepositorioEventos from "../repositorios/RepositorioEventos.js";
import RepositorioResenas from "../repositorios/RepositorioResenas.js";
import RepositorioUsuarios from "../repositorios/RepositorioUsuarios.js";

export default class ServicioCompras {
  constructor({
    repositorioCompras = new RepositorioCompras(),
    repositorioEventos = new RepositorioEventos(),
    repositorioUsuarios = new RepositorioUsuarios(),
    repositorioResenas = new RepositorioResenas(),
    fecha = () => new Date()
  } = {}) {
    this.repositorioCompras = repositorioCompras;
    this.repositorioEventos = repositorioEventos;
    this.repositorioUsuarios = repositorioUsuarios;
    this.repositorioResenas = repositorioResenas;
    this.fecha = fecha;
  }

  async comprar(usuarioId, { eventoId, tipoEntradaId, cantidad }) {
    const comprador = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    const evento = await this.repositorioEventos.obtenerPorId(eventoId);
    const ahora = this.fecha();
    const compra = Compra.solicitar({ comprador, evento, tipoEntradaId, cantidad, ahora });
    await this.repositorioCompras.guardar(compra);
    await this.repositorioEventos.guardar(evento);
    return { compra: compra.detalle(comprador, ahora) };
  }

  async listarMisCompras(usuarioId) {
    const comprador = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    comprador.exigirRol(RolUsuario.COMPRADOR);
    const ahora = this.fecha();
    const compras = await this.repositorioCompras.listarPorComprador(comprador.id);
    return { compras: compras.map(compra => compra.resumen(ahora)) };
  }

  async obtener(usuarioId, compraId) {
    const { usuario, compra, ahora } = await this.#cargarParticipante(usuarioId, compraId);
    return { compra: compra.detalle(usuario, ahora) };
  }

  async pagar(usuarioId, compraId) {
    return this.#ejecutar(usuarioId, compraId, (compra, usuario, ahora) => compra.pagar(usuario, ahora));
  }

  async cancelar(usuarioId, compraId) {
    return this.#ejecutar(usuarioId, compraId, (compra, usuario, ahora) => compra.cancelar(usuario, ahora));
  }

  async utilizar(usuarioId, compraId) {
    return this.#ejecutar(usuarioId, compraId, (compra, usuario, ahora) => compra.utilizar(usuario, ahora));
  }

  async listarConversaciones(usuarioId) {
    const usuario = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    const compras = await this.repositorioCompras.listarPorParticipante(usuario);
    return { conversaciones: Compra.conversaciones(compras, usuario) };
  }

  async listarMensajes(usuarioId, compraId) {
    const { compra } = await this.#cargarParticipante(usuarioId, compraId);
    return { mensajes: compra.mensajes.map(mensaje => mensaje.toJSON()) };
  }

  async enviarMensaje(usuarioId, compraId, { mensaje }) {
    const { usuario, compra, ahora } = await this.#cargarParticipante(usuarioId, compraId);
    const nuevo = compra.enviarMensaje(usuario, mensaje, ahora);
    await this.repositorioCompras.guardar(compra);
    return { mensaje: nuevo.toJSON() };
  }

  async calificar(usuarioId, compraId, datos) {
    const { usuario, compra, ahora } = await this.#cargarParticipante(usuarioId, compraId);
    const resena = compra.calificar(usuario, datos ?? {}, ahora);
    await this.repositorioResenas.guardar(resena);
    await this.repositorioCompras.guardar(compra);
    return { resena: resena.toJSON() };
  }

  async #ejecutar(usuarioId, compraId, accion) {
    const { usuario, compra, ahora } = await this.#cargarParticipante(usuarioId, compraId);
    accion(compra, usuario, ahora);
    await this.repositorioCompras.guardar(compra);
    return { compra: compra.detalle(usuario, ahora) };
  }

  async #cargarParticipante(usuarioId, compraId) {
    const usuario = await this.repositorioUsuarios.obtenerPorId(usuarioId);
    const compra = await this.repositorioCompras.obtenerPorId(compraId);
    compra.exigirParticipante(usuario);
    return { usuario, compra, ahora: this.fecha() };
  }
}
