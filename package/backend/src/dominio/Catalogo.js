import OrdenDeEventos from "./OrdenDeEventos.js";
import Reputacion from "./Reputacion.js";
import { BadRequest } from "./errores.js";
import { CriterioOrden, DireccionOrden } from "./enums.js";
import { listaDe, numeroEnRango } from "./validaciones.js";

export default class Catalogo {
  constructor({ eventos = [], resenas = [] } = {}) {
    this.eventos = listaDe(eventos, "Los eventos");
    this.resenas = listaDe(resenas, "Las reseñas");
  }

  reputacionDe(organizador) {
    return new Reputacion(this.resenas.filter(resena => resena.evento.organizador.id === organizador.id));
  }

  buscar({ busqueda, categoria, precioMin, precioMax, ordenar = CriterioOrden.FECHA, direccion = DireccionOrden.ASCENDENTE } = {}, ahora) {
    const orden = new OrdenDeEventos({ criterio: ordenar, direccion });
    const minimo = precioMin === undefined ? 0 : numeroEnRango(precioMin, "El precio mínimo", { min: 0 });
    const maximo = precioMax === undefined ? Infinity : numeroEnRango(precioMax, "El precio máximo", { min: 0 });
    if (minimo > maximo) {
      throw new BadRequest("El precio mínimo no puede superar al máximo.");
    }

    const candidatos = this.eventos
      .filter(evento => !evento.yaSeRealizo(ahora))
      .filter(evento => !busqueda || evento.coincideConBusqueda(busqueda))
      .filter(evento => !categoria || evento.perteneceACategoria(categoria))
      .filter(evento => evento.tuPrecioEstaEntre(minimo, maximo));

    return orden.ordenar(candidatos, this);
  }
}
