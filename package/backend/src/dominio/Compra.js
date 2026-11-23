import { randomUUID } from "node:crypto";
import CambioEstadoCompra from "./CambioEstadoCompra.js";
import Evento from "./Evento.js";
import Mensaje from "./Mensaje.js";
import Resena from "./Resena.js";
import TipoEntrada from "./TipoEntrada.js";
import Usuario from "./Usuario.js";
import { estadoDeCompra } from "./EstadosCompra.js";
import { Forbidden, Conflict, BadRequest } from "./errores.js";
import { EstadoCompra, RolUsuario } from "./enums.js";
import { enteroEnRango, fechaValida, instanciaDe, listaDe, textoRequerido, valorDeEnum } from "./validaciones.js";

const MAXIMO_ENTRADAS_POR_COMPRA = 10;
const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

export default class Compra {
  #estado;

  constructor({
    id = randomUUID(),
    comprador,
    evento,
    tipoEntrada,
    cantidad,
    estado = EstadoCompra.PENDIENTE,
    mensajes = [],
    historial = [],
    resena = null,
    creada
  } = {}) {
    this.id = textoRequerido(id, "El id de la compra");
    this.comprador = instanciaDe(comprador, Usuario, "El comprador");
    this.comprador.exigirRol(RolUsuario.COMPRADOR);
    this.evento = instanciaDe(evento, Evento, "El evento");
    this.tipoEntrada = instanciaDe(tipoEntrada, TipoEntrada, "El tipo de entrada");
    if (!this.evento.tiposEntrada.includes(this.tipoEntrada)) {
      throw new BadRequest("El tipo de entrada no pertenece al evento.");
    }
    this.cantidad = enteroEnRango(cantidad, "La cantidad", { min: 1, max: MAXIMO_ENTRADAS_POR_COMPRA });
    this.total = this.tipoEntrada.precio * this.cantidad;
    this.#estado = estadoDeCompra(valorDeEnum(estado, EstadoCompra, "El estado de la compra"));
    this.mensajes = listaDe(mensajes, "Los mensajes");
    this.historial = listaDe(historial, "El historial");
    if (resena !== null) instanciaDe(resena, Resena, "La reseña");
    this.resena = resena;
    this.creada = fechaValida(creada, "La fecha de la compra");
  }

  // Factory Method: aplica las reglas de alta (rol, fecha, cantidad, cupo) y reserva las entradas.
  static solicitar({ comprador, evento, tipoEntradaId, cantidad, ahora }) {
    instanciaDe(comprador, Usuario, "El comprador").exigirRol(RolUsuario.COMPRADOR);
    instanciaDe(evento, Evento, "El evento");
    if (evento.yaSeRealizo(ahora)) {
      throw new Conflict("El evento ya se realizó: no se pueden comprar entradas.");
    }
    enteroEnRango(cantidad, "La cantidad", { min: 1, max: MAXIMO_ENTRADAS_POR_COMPRA });
    const tipoEntrada = evento.obtenerTipoEntrada(tipoEntradaId);
    tipoEntrada.reservar(cantidad);
    const compra = new Compra({ comprador, evento, tipoEntrada, cantidad, creada: ahora });
    compra.cambiarEstado(EstadoCompra.PENDIENTE, comprador, ahora);
    return compra;
  }

  get estado() {
    return this.#estado.nombre;
  }

  cambiarEstado(estado, quien, ahora) {
    this.#estado = estadoDeCompra(estado);
    this.historial.push(new CambioEstadoCompra({ compra: this, estado, quien, fechaHora: ahora }));
  }

  liberarCupo() {
    this.tipoEntrada.liberar(this.cantidad);
  }

  esDelComprador(usuario) {
    return this.comprador.id === usuario.id;
  }

  esParticipante(usuario) {
    return this.esDelComprador(usuario) || this.evento.esDeOrganizador(usuario);
  }

  exigirParticipante(usuario) {
    if (!this.esParticipante(usuario)) {
      throw new Forbidden("Solo el comprador y el organizador pueden acceder a esta compra.");
    }
  }

  exigirComprador(usuario) {
    if (!this.esDelComprador(usuario)) {
      throw new Forbidden("Solo el comprador puede realizar esta acción sobre su compra.");
    }
  }

  puedePagar(ahora) {
    return this.#estado.puedePagar(this, ahora);
  }

  puedeCancelar(ahora) {
    return this.#estado.puedeCancelar(this, ahora);
  }

  puedeUtilizarse() {
    return this.#estado.puedeUtilizarse(this);
  }

  puedeCalificarse() {
    return this.#estado.puedeCalificarse(this);
  }

  pagar(usuario, ahora) {
    this.exigirComprador(usuario);
    this.#estado.pagar(this, usuario, ahora);
  }

  cancelar(usuario, ahora) {
    this.exigirComprador(usuario);
    this.#estado.cancelar(this, usuario, ahora);
  }

  utilizar(usuario, ahora) {
    this.evento.exigirOrganizador(usuario);
    this.#estado.utilizar(this, usuario, ahora);
  }

  enviarMensaje(usuario, texto, ahora) {
    this.exigirParticipante(usuario);
    const mensaje = new Mensaje({ usuario, mensaje: texto, enviado: ahora });
    this.mensajes.push(mensaje);
    return mensaje;
  }

  // Resumen del chat de la compra desde el punto de vista de `usuario`: con quién habla y el último mensaje.
  conversacion(usuario) {
    this.exigirParticipante(usuario);
    const interlocutor = this.esDelComprador(usuario) ? this.evento.organizador : this.comprador;
    const ultimo = this.mensajes[this.mensajes.length - 1];
    return {
      compraId: this.id,
      evento: { id: this.evento.id, nombre: this.evento.nombre },
      interlocutor: interlocutor.resumen(),
      cantidadMensajes: this.mensajes.length,
      ultimoMensaje: ultimo ? ultimo.toJSON() : null
    };
  }

  // Conversaciones del usuario: solo compras con mensajes, la más reciente primero.
  static conversaciones(compras, usuario) {
    return compras
      .filter(compra => compra.esParticipante(usuario) && compra.mensajes.length > 0)
      .map(compra => compra.conversacion(usuario))
      .sort((a, b) => b.ultimoMensaje.enviado - a.ultimoMensaje.enviado);
  }

  calificar(usuario, { puntuacion, detalle }, ahora) {
    this.exigirComprador(usuario);
    if (this.resena !== null) {
      throw new Conflict("Esta compra ya fue calificada.");
    }
    if (this.estado !== EstadoCompra.UTILIZADA) {
      throw new Conflict("Solo se puede calificar un evento cuya entrada fue utilizada.");
    }
    this.resena = new Resena({ comprador: usuario, evento: this.evento, puntuacion, detalle, fecha: ahora });
    return this.resena;
  }

  diasRestantes(ahora) {
    if (!this.#estado.tieneDiasRestantes()) return null;
    const diferencia = this.evento.fecha - ahora;
    return diferencia <= 0 ? 0 : Math.ceil(diferencia / MILISEGUNDOS_POR_DIA);
  }

  acciones(usuario, ahora) {
    const esComprador = this.esDelComprador(usuario);
    return {
      pagar: esComprador && this.puedePagar(ahora),
      cancelar: esComprador && this.puedeCancelar(ahora),
      utilizar: this.evento.esDeOrganizador(usuario) && this.puedeUtilizarse(),
      calificar: esComprador && this.puedeCalificarse(),
      enviarMensaje: true
    };
  }

  resumen(ahora) {
    return {
      id: this.id,
      estado: this.estado,
      cantidad: this.cantidad,
      total: this.total,
      creada: this.creada,
      diasRestantes: this.diasRestantes(ahora),
      comprador: this.comprador.resumen(),
      evento: {
        id: this.evento.id,
        nombre: this.evento.nombre,
        fecha: this.evento.fecha,
        ubicacion: this.evento.ubicacion
      },
      tipoEntrada: {
        id: this.tipoEntrada.id,
        nombre: this.tipoEntrada.nombre,
        precio: this.tipoEntrada.precio
      }
    };
  }

  detalle(usuario, ahora) {
    return {
      ...this.resumen(ahora),
      mensajes: this.mensajes.map(mensaje => mensaje.toJSON()),
      historial: this.historial.map(cambio => cambio.toJSON()),
      resena: this.resena ? this.resena.toJSON() : null,
      acciones: this.acciones(usuario, ahora)
    };
  }
}
