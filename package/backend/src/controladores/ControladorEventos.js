import ServicioEventos from "../servicios/ServicioEventos.js";
import { numeroDeConsulta, textoDeConsulta } from "./parametros.js";

export default class ControladorEventos {
  constructor({ servicioEventos = new ServicioEventos() } = {}) {
    this.servicioEventos = servicioEventos;
  }

  listarCategorias = async (_req, res, next) => {
    try {
      const resultado = await this.servicioEventos.listarCategorias();
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  buscar = async (req, res, next) => {
    try {
      const { busqueda, categoria, ordenar, direccion, precioMin, precioMax } = req.query;
      const resultado = await this.servicioEventos.buscar(req.usuario.id, {
        busqueda: textoDeConsulta(busqueda),
        categoria: textoDeConsulta(categoria),
        ordenar: textoDeConsulta(ordenar),
        direccion: textoDeConsulta(direccion),
        precioMin: numeroDeConsulta(precioMin),
        precioMax: numeroDeConsulta(precioMax)
      });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  obtener = async (req, res, next) => {
    try {
      const resultado = await this.servicioEventos.obtener(req.usuario.id, req.params.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  publicar = async (req, res, next) => {
    try {
      const resultado = await this.servicioEventos.publicar(req.usuario.id, req.body ?? {});
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  listarOrganizados = async (req, res, next) => {
    try {
      const resultado = await this.servicioEventos.listarOrganizados(req.usuario.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  listarComprasDeEvento = async (req, res, next) => {
    try {
      const resultado = await this.servicioEventos.listarComprasDeEvento(req.usuario.id, req.params.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };
}
