import Usuario from "./Usuario.js";
import { BadRequest } from "./errores.js";
import { EstadoCompra } from "./enums.js";
import { fechaValida, instanciaDe, valorDeEnum } from "./validaciones.js";

export default class CambioEstadoCompra {
  constructor({ compra, estado, quien, fechaHora } = {}) {
    if (!compra) {
      throw new BadRequest("La compra del cambio de estado es obligatoria.");
    }
    this.compra = compra;
    this.estado = valorDeEnum(estado, EstadoCompra, "El estado");
    this.quien = instanciaDe(quien, Usuario, "Quien realiza el cambio de estado");
    this.fechaHora = fechaValida(fechaHora, "La fecha del cambio de estado");
  }

  toJSON() {
    return {
      estado: this.estado,
      quien: { ...this.quien.resumen(), rol: this.quien.rol },
      fechaHora: this.fechaHora
    };
  }
}
