import { Router } from "express";
import ControladorSesion from "../controladores/ControladorSesion.js";
import ControladorEventos from "../controladores/ControladorEventos.js";
import ControladorFavoritos from "../controladores/ControladorFavoritos.js";
import ControladorCompras from "../controladores/ControladorCompras.js";

export default function crearRutas({
  autenticar,
  controladorSesion = new ControladorSesion(),
  controladorEventos = new ControladorEventos(),
  controladorFavoritos = new ControladorFavoritos(),
  controladorCompras = new ControladorCompras()
}) {
  const rutas = Router();

  // Healt
  rutas.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Login
  rutas.post("/sesion", controladorSesion.iniciarSesion);
  rutas.get("/sesion", autenticar, controladorSesion.obtenerSesion);
  rutas.delete("/sesion", autenticar, controladorSesion.cerrarSesion);

  // Categorias
  rutas.get("/categorias", autenticar, controladorEventos.listarCategorias);

  // Eventos
  rutas.get("/eventos", autenticar, controladorEventos.buscar);
  rutas.post("/eventos", autenticar, controladorEventos.publicar);
  rutas.get("/eventos/organizados", autenticar, controladorEventos.listarOrganizados);
  rutas.get("/eventos/:id", autenticar, controladorEventos.obtener);
  rutas.get("/eventos/:id/compras", autenticar, controladorEventos.listarComprasDeEvento);

  // Favoritos
  rutas.get("/favoritos", autenticar, controladorFavoritos.listar);
  rutas.put("/favoritos/:eventoId", autenticar, controladorFavoritos.agregar);
  rutas.delete("/favoritos/:eventoId", autenticar, controladorFavoritos.quitar);

  // Compras
  rutas.post("/compras", autenticar, controladorCompras.comprar);
  rutas.get("/compras", autenticar, controladorCompras.listarMisCompras);
  rutas.get("/compras/:id", autenticar, controladorCompras.obtener);
  rutas.post("/compras/:id/pago", autenticar, controladorCompras.pagar);
  rutas.post("/compras/:id/cancelacion", autenticar, controladorCompras.cancelar);
  rutas.post("/compras/:id/utilizacion", autenticar, controladorCompras.utilizar);
  rutas.get("/mensajes", autenticar, controladorCompras.listarConversaciones);
  rutas.get("/compras/:id/mensajes", autenticar, controladorCompras.listarMensajes);
  rutas.post("/compras/:id/mensajes", autenticar, controladorCompras.enviarMensaje);
  rutas.post("/compras/:id/resena", autenticar, controladorCompras.calificar);

  return rutas;
}
