const HORAS_SESION_POR_DEFECTO = 8;

function entero(valor, porDefecto) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : porDefecto;
}

export function leerConfiguracion(entorno = process.env) {
  const origenes = (entorno.CORS_ORIGINS ?? "*").split(",").map(origen => origen.trim()).filter(Boolean);
  return {
    puerto: entero(entorno.PORT, 4000),
    host: entorno.HOST || "0.0.0.0",
    origenesPermitidos: origenes.includes("*") ? "*" : origenes,
    duracionSesionMs: entero(entorno.DURACION_SESION_HORAS, HORAS_SESION_POR_DEFECTO) * 60 * 60 * 1000,
    cargarDatosDeEjemplo: entorno.CARGAR_DATOS_EJEMPLO !== "false"
  };
}
