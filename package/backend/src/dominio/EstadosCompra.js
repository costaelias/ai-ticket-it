import { Conflict } from "./errores.js";
import { EstadoCompra } from "./enums.js";

// Patrón State: cada estado de la compra decide qué operaciones admite y a qué estado transiciona.
class EstadoDeCompra {
  constructor(nombre) {
    this.nombre = nombre;
  }

  puedePagar() {
    return false;
  }

  puedeCancelar() {
    return false;
  }

  puedeUtilizarse() {
    return false;
  }

  puedeCalificarse() {
    return false;
  }

  tieneDiasRestantes() {
    return false;
  }

  pagar() {
    throw new Conflict("Solo se puede pagar una compra pendiente de un evento que aún no se realizó.");
  }

  cancelar() {
    throw new Conflict(`La compra ya está ${this.nombre}.`);
  }

  utilizar() {
    throw new Conflict("Solo se puede utilizar una entrada de una compra confirmada.");
  }
}

class EstadoCancelable extends EstadoDeCompra {
  constructor(nombre, estadoAlCancelar) {
    super(nombre);
    this.estadoAlCancelar = estadoAlCancelar;
  }

  puedeCancelar(compra, ahora) {
    return !compra.evento.yaSeRealizo(ahora);
  }

  cancelar(compra, usuario, ahora) {
    if (!this.puedeCancelar(compra, ahora)) {
      throw new Conflict("No se puede cancelar una compra de un evento que ya se realizó.");
    }
    compra.liberarCupo();
    compra.cambiarEstado(this.estadoAlCancelar, usuario, ahora);
  }
}

class Pendiente extends EstadoCancelable {
  constructor() {
    super(EstadoCompra.PENDIENTE, EstadoCompra.CANCELADA);
  }

  puedePagar(compra, ahora) {
    return !compra.evento.yaSeRealizo(ahora);
  }

  pagar(compra, usuario, ahora) {
    if (!this.puedePagar(compra, ahora)) return super.pagar();
    compra.cambiarEstado(EstadoCompra.CONFIRMADA, usuario, ahora);
  }
}

class Confirmada extends EstadoCancelable {
  constructor() {
    super(EstadoCompra.CONFIRMADA, EstadoCompra.REEMBOLSADA);
  }

  puedeUtilizarse() {
    return true;
  }

  tieneDiasRestantes() {
    return true;
  }

  utilizar(compra, usuario, ahora) {
    compra.cambiarEstado(EstadoCompra.UTILIZADA, usuario, ahora);
  }
}

class Utilizada extends EstadoDeCompra {
  constructor() {
    super(EstadoCompra.UTILIZADA);
  }

  puedeCalificarse(compra) {
    return compra.resena === null;
  }

  cancelar() {
    throw new Conflict("No se puede cancelar una compra cuya entrada ya fue utilizada.");
  }
}

const ESTADOS = Object.freeze({
  [EstadoCompra.PENDIENTE]: new Pendiente(),
  [EstadoCompra.CONFIRMADA]: new Confirmada(),
  [EstadoCompra.UTILIZADA]: new Utilizada(),
  [EstadoCompra.CANCELADA]: new EstadoDeCompra(EstadoCompra.CANCELADA),
  [EstadoCompra.REEMBOLSADA]: new EstadoDeCompra(EstadoCompra.REEMBOLSADA)
});

export function estadoDeCompra(nombre) {
  return ESTADOS[nombre];
}
