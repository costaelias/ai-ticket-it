import { CriterioOrden, DireccionOrden } from "./enums.js";
import { valorDeEnum } from "./validaciones.js";

// Patrón Strategy: cada criterio sabe qué valor del evento se compara al ordenar.
class OrdenPorPrecio {
  valorDe(evento) {
    return evento.precioMinimo();
  }
}

class OrdenPorFecha {
  valorDe(evento) {
    return evento.fecha.getTime();
  }
}

class OrdenPorPuntaje {
  valorDe(evento, catalogo) {
    return catalogo.reputacionDe(evento.organizador).promedio() ?? 0;
  }
}

const ESTRATEGIAS = Object.freeze({
  [CriterioOrden.PRECIO]: new OrdenPorPrecio(),
  [CriterioOrden.FECHA]: new OrdenPorFecha(),
  [CriterioOrden.PUNTAJE]: new OrdenPorPuntaje()
});

export default class OrdenDeEventos {
  constructor({ criterio = CriterioOrden.FECHA, direccion = DireccionOrden.ASCENDENTE } = {}) {
    this.estrategia = ESTRATEGIAS[valorDeEnum(criterio, CriterioOrden, "El criterio de orden")];
    this.sentido = valorDeEnum(direccion, DireccionOrden, "La dirección de orden") === DireccionOrden.ASCENDENTE ? 1 : -1;
  }

  ordenar(eventos, catalogo) {
    return eventos
      .map(evento => ({ evento, valor: this.estrategia.valorDe(evento, catalogo) }))
      .sort((a, b) => (a.valor - b.valor) * this.sentido || a.evento.fecha - b.evento.fecha)
      .map(({ evento }) => evento);
  }
}
