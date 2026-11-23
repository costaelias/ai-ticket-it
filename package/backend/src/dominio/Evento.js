import { randomUUID } from "node:crypto";
import Categoria from "./Categoria.js";
import TipoEntrada from "./TipoEntrada.js";
import Usuario from "./Usuario.js";
import { Forbidden, Conflict, BadRequest } from "./errores.js";
import { RolUsuario } from "./enums.js";
import { fechaValida, instanciaDe, listaDe, normalizarTexto, textoOpcional, textoRequerido } from "./validaciones.js";

const MAXIMO_TIPOS_ENTRADA = 20;
const MAXIMO_MULTIMEDIA = 10;

export default class Evento {
  constructor({
    id = randomUUID(),
    nombre,
    descripcion,
    categoria,
    fecha,
    ubicacion,
    multimedia = [],
    tiposEntrada,
    organizador
  } = {}) {
    this.id = textoRequerido(id, "El id del evento");
    this.nombre = textoRequerido(nombre, "El nombre del evento", { min: 3, max: 120 });
    this.descripcion = textoRequerido(descripcion, "La descripción del evento", { max: 2000 });
    this.categoria = instanciaDe(categoria, Categoria, "La categoría");
    this.fecha = fechaValida(fecha, "La fecha del evento");
    this.ubicacion = textoRequerido(ubicacion, "La ubicación", { max: 150 });
    this.multimedia = Evento.#validarMultimedia(multimedia);
    this.tiposEntrada = Evento.#validarTiposEntrada(tiposEntrada);
    this.organizador = instanciaDe(organizador, Usuario, "El organizador");
    this.organizador.exigirRol(RolUsuario.ORGANIZADOR);
  }

  // Factory Method: convierte los datos crudos de la petición en un evento válido y futuro.
  static publicar(datos = {}, ahora) {
    instanciaDe(datos.organizador, Usuario, "El organizador").exigirRol(RolUsuario.ORGANIZADOR);
    const fecha = fechaValida(datos.fecha, "La fecha del evento");
    if (fecha <= ahora) {
      throw new BadRequest("La fecha del evento debe ser futura.");
    }
    const tiposEntrada = listaDe(datos.tiposEntrada, "Los tipos de entrada").map(tipo => new TipoEntrada({
      nombre: tipo?.nombre,
      descripcion: tipo?.descripcion,
      precio: tipo?.precio,
      cupo: tipo?.cupo
    }));
    return new Evento({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      categoria: Categoria.deNombre(datos.categoria),
      ubicacion: datos.ubicacion,
      multimedia: datos.multimedia,
      fecha,
      tiposEntrada,
      organizador: datos.organizador
    });
  }

  static #validarTiposEntrada(tiposEntrada) {
    listaDe(tiposEntrada, "Los tipos de entrada");
    if (tiposEntrada.length === 0) {
      throw new BadRequest("El evento necesita al menos un tipo de entrada.");
    }
    if (tiposEntrada.length > MAXIMO_TIPOS_ENTRADA) {
      throw new BadRequest(`El evento no puede tener más de ${MAXIMO_TIPOS_ENTRADA} tipos de entrada.`);
    }
    tiposEntrada.forEach(tipo => instanciaDe(tipo, TipoEntrada, "El tipo de entrada"));
    const nombres = new Set(tiposEntrada.map(tipo => normalizarTexto(tipo.nombre)));
    if (nombres.size !== tiposEntrada.length) {
      throw new BadRequest("Los tipos de entrada no pueden repetir su nombre.");
    }
    return tiposEntrada;
  }

  static #validarMultimedia(multimedia = []) {
    if (!Array.isArray(multimedia) || multimedia.length > MAXIMO_MULTIMEDIA) {
      throw new BadRequest(`La multimedia admite hasta ${MAXIMO_MULTIMEDIA} enlaces.`);
    }
    return multimedia
      .map(enlace => textoOpcional(enlace, "El enlace multimedia", { max: 500 }))
      .filter(Boolean);
  }

  yaSeRealizo(ahora) {
    return this.fecha <= ahora;
  }

  esDeOrganizador(usuario) {
    return this.organizador.id === usuario.id;
  }

  exigirOrganizador(usuario) {
    if (!this.esDeOrganizador(usuario)) {
      throw new Forbidden("Solo el organizador del evento puede realizar esta acción.");
    }
  }

  obtenerTipoEntrada(tipoEntradaId) {
    const tipo = this.tiposEntrada.find(candidato => candidato.id === tipoEntradaId);
    if (!tipo) {
      throw new Conflict("El tipo de entrada no pertenece a este evento.");
    }
    return tipo;
  }

  precioMinimo() {
    return Math.min(...this.tiposEntrada.map(tipo => tipo.precio));
  }

  tuPrecioEstaEntre(minimo, maximo) {
    return this.tiposEntrada.some(tipo => tipo.precio >= minimo && tipo.precio <= maximo);
  }

  perteneceACategoria(nombre) {
    return this.categoria.coincideCon(nombre);
  }

  coincideConBusqueda(texto) {
    const buscado = normalizarTexto(texto);
    const campos = [this.nombre, this.descripcion, this.ubicacion, this.categoria.nombre];
    return campos.some(campo => normalizarTexto(campo).includes(buscado));
  }

  resumen({ reputacion, esFavorito = false } = {}) {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      categoria: this.categoria.toJSON(),
      fecha: this.fecha,
      ubicacion: this.ubicacion,
      multimedia: this.multimedia,
      precioDesde: this.precioMinimo(),
      tiposEntrada: this.tiposEntrada.map(tipo => tipo.toJSON()),
      organizador: {
        ...this.organizador.resumen(),
        ...(reputacion ? reputacion.resumen() : { puntaje: null, cantidadResenas: 0 })
      },
      esFavorito
    };
  }

  detalle({ reputacion, esFavorito = false } = {}) {
    return {
      ...this.resumen({ reputacion, esFavorito }),
      resenasOrganizador: reputacion ? reputacion.toJSON().resenas : []
    };
  }
}
