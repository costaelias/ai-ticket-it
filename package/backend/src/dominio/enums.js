export const EstadoCompra = Object.freeze({
  PENDIENTE: "pendiente",
  CONFIRMADA: "confirmada",
  UTILIZADA: "utilizada",
  CANCELADA: "cancelada",
  REEMBOLSADA: "reembolsada"
});

export const RolUsuario = Object.freeze({
  COMPRADOR: "comprador",
  ORGANIZADOR: "organizador"
});

export const CriterioOrden = Object.freeze({
  PRECIO: "precio",
  FECHA: "fecha",
  PUNTAJE: "puntaje"
});

export const DireccionOrden = Object.freeze({
  ASCENDENTE: "asc",
  DESCENDENTE: "desc"
});
