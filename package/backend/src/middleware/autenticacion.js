import { Unauthorized } from "../dominio/errores.js";
import ServicioAutenticacion from "../servicios/ServicioAutenticacion.js";

export function extraerToken(req) {
  const [esquema, token] = (req.headers.authorization ?? "").split(" ");
  return esquema === "Bearer" && token ? token : null;
}

export default function crearMiddlewareAutenticacion(servicioAutenticacion = new ServicioAutenticacion()) {
  return async (req, _res, next) => {
    try {
      const token = extraerToken(req);
      if (!token) throw new Unauthorized("Falta el encabezado Authorization: Bearer <token>.");
      req.usuario = await servicioAutenticacion.autenticar(token);
      req.token = token;
      next();
    } catch (error) {
      next(error);
    }
  };
}
