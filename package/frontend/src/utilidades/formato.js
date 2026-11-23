const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const formatoPrecio = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export function formatearFecha(fechaIso) {
  return formatoFecha.format(new Date(fechaIso));
}

export function formatearPrecio(monto) {
  return monto === 0 ? "Gratis" : formatoPrecio.format(monto);
}

export function describirDiasRestantes(dias) {
  if (dias === null || dias === undefined) return null;
  if (dias === 0) return "El evento es hoy";
  return dias === 1 ? "Falta 1 día" : `Faltan ${dias} días`;
}

export function describirPuntaje(organizador) {
  if (organizador.puntaje === null || organizador.puntaje === undefined) return "Sin reseñas";
  const cantidad = organizador.cantidadResenas;
  return `★ ${organizador.puntaje.toFixed(1)} (${cantidad} ${cantidad === 1 ? "reseña" : "reseñas"})`;
}

export function nombreCompleto(usuario) {
  return `${usuario.nombre} ${usuario.apellido}`;
}
