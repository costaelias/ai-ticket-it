import ServicioAutenticacion from "../servicios/ServicioAutenticacion.js";

export default class ControladorSesion {
  constructor({ servicioAutenticacion = new ServicioAutenticacion() } = {}) {
    this.servicioAutenticacion = servicioAutenticacion;
  }

  iniciarSesion = async (req, res, next) => {
    try {
      const { correo, clave } = req.body ?? {};
      const resultado = await this.servicioAutenticacion.iniciarSesion({ correo, clave });
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  obtenerSesion = (req, res) => {
    res.json({ usuario: req.usuario });
  };

  cerrarSesion = async (req, res, next) => {
    try {
      await this.servicioAutenticacion.cerrarSesion(req.token);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
