import ServicioCompras from "../servicios/ServicioCompras.js";

export default class ControladorCompras {
  constructor({ servicioCompras = new ServicioCompras() } = {}) {
    this.servicioCompras = servicioCompras;
  }

  comprar = async (req, res, next) => {
    try {
      const { eventoId, tipoEntradaId, cantidad } = req.body ?? {};
      const resultado = await this.servicioCompras.comprar(req.usuario.id, { eventoId, tipoEntradaId, cantidad });
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  listarMisCompras = async (req, res, next) => {
    try {
      const resultado = await this.servicioCompras.listarMisCompras(req.usuario.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  obtener = async (req, res, next) => {
    try {
      const resultado = await this.servicioCompras.obtener(req.usuario.id, req.params.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  pagar = async (req, res, next) => {
    try {
      const resultado = await this.servicioCompras.pagar(req.usuario.id, req.params.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  cancelar = async (req, res, next) => {
    try {
      const resultado = await this.servicioCompras.cancelar(req.usuario.id, req.params.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  utilizar = async (req, res, next) => {
    try {
      const resultado = await this.servicioCompras.utilizar(req.usuario.id, req.params.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  listarConversaciones = async (req, res, next) => {
    try {
      const resultado = await this.servicioCompras.listarConversaciones(req.usuario.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  listarMensajes = async (req, res, next) => {
    try {
      const resultado = await this.servicioCompras.listarMensajes(req.usuario.id, req.params.id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  enviarMensaje = async (req, res, next) => {
    try {
      const { mensaje } = req.body ?? {};
      const resultado = await this.servicioCompras.enviarMensaje(req.usuario.id, req.params.id, { mensaje });
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  calificar = async (req, res, next) => {
    try {
      const { puntuacion, detalle } = req.body ?? {};
      const resultado = await this.servicioCompras.calificar(req.usuario.id, req.params.id, { puntuacion, detalle });
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}
