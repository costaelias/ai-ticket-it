import ServicioFavoritos from "../servicios/ServicioFavoritos.js";

export default class ControladorFavoritos {
  constructor({ servicioFavoritos = new ServicioFavoritos() } = {}) {
    this.servicioFavoritos = servicioFavoritos;
  }

  listar = async (req, res, next) => {
    try {
      const resultado = await this.servicioFavoritos.listar(req.usuario.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  agregar = async (req, res, next) => {
    try {
      const resultado = await this.servicioFavoritos.agregar(req.usuario.id, req.params.eventoId);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  quitar = async (req, res, next) => {
    try {
      const resultado = await this.servicioFavoritos.quitar(req.usuario.id, req.params.eventoId);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };
}
