import { ErrorAplicacion } from "../dominio/errores.js";

export function manejarRutaInexistente(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.path}` });
}

export function manejarErrores(error, _req, res, _next) {
  if (error instanceof ErrorAplicacion) {
    return res.status(error.estado).json({ mensaje: error.message });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "El cuerpo de la petición no es un JSON válido." });
  }
  console.error(error);
  return res.status(500).json({ mensaje: "Ocurrió un error inesperado." });
}
