import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import crearContenedor from "./contenedor.js";
import { especificacionOpenApi } from "./docs/openapi.js";
import crearMiddlewareAutenticacion from "./middleware/autenticacion.js";
import { manejarErrores, manejarRutaInexistente } from "./middleware/manejadorErrores.js";
import crearRutas from "./rutas/rutas.js";

export default function crearApp({ contenedor = crearContenedor(), origenesPermitidos = "*" } = {}) {
  const app = express();
  app.use(cors(origenesPermitidos === "*" ? {} : { origin: origenesPermitidos }));
  app.use(express.json());

  app.get("/api/docs.json", (_req, res) => res.json(especificacionOpenApi));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(especificacionOpenApi, { customSiteTitle: "AI Ticket It - API" }));

  app.use("/api", crearRutas({
    autenticar: crearMiddlewareAutenticacion(contenedor.servicios.servicioAutenticacion),
    ...contenedor.controladores
  }));

  app.use(manejarRutaInexistente);
  app.use(manejarErrores);
  return app;
}
