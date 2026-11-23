import Sesion, { DURACION_SESION_POR_DEFECTO_MS } from "../dominio/Sesion.js";
import { Unauthorized } from "../dominio/errores.js";
import RepositorioSesiones from "../repositorios/RepositorioSesiones.js";
import RepositorioUsuarios from "../repositorios/RepositorioUsuarios.js";

export default class ServicioAutenticacion {
  constructor({
    repositorioUsuarios = new RepositorioUsuarios(),
    repositorioSesiones = new RepositorioSesiones(),
    fecha = () => new Date(),
    duracionSesionMs = DURACION_SESION_POR_DEFECTO_MS
  } = {}) {
    this.repositorioUsuarios = repositorioUsuarios;
    this.repositorioSesiones = repositorioSesiones;
    this.fecha = fecha;
    this.duracionSesionMs = duracionSesionMs;
  }

  async iniciarSesion({ correo, clave }) {
    const usuario = await this.repositorioUsuarios.buscarPorCorreo(correo);
    if (!usuario || !usuario.verificarClave(clave)) {
      throw new Unauthorized("Correo o clave incorrectos.");
    }
    const sesion = Sesion.iniciar(usuario, this.fecha(), this.duracionSesionMs);
    await this.repositorioSesiones.guardar(sesion);
    return { token: sesion.token, usuario: usuario.toJSON() };
  }

  async autenticar(token) {
    const sesion = token ? await this.repositorioSesiones.buscarPorToken(token) : null;
    if (!sesion || !sesion.estaVigente(this.fecha())) {
      throw new Unauthorized("La sesión no es válida o expiró.");
    }
    return (await this.repositorioUsuarios.obtenerPorId(sesion.usuarioId)).toJSON();
  }

  async cerrarSesion(token) {
    await this.repositorioSesiones.eliminar(token);
  }
}
