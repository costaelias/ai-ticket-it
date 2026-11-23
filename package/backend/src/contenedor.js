import RepositorioCompras from "./repositorios/RepositorioCompras.js";
import RepositorioEventos from "./repositorios/RepositorioEventos.js";
import RepositorioResenas from "./repositorios/RepositorioResenas.js";
import RepositorioSesiones from "./repositorios/RepositorioSesiones.js";
import RepositorioUsuarios from "./repositorios/RepositorioUsuarios.js";
import ServicioAutenticacion from "./servicios/ServicioAutenticacion.js";
import ServicioCompras from "./servicios/ServicioCompras.js";
import ServicioEventos from "./servicios/ServicioEventos.js";
import ServicioFavoritos from "./servicios/ServicioFavoritos.js";
import ControladorCompras from "./controladores/ControladorCompras.js";
import ControladorEventos from "./controladores/ControladorEventos.js";
import ControladorFavoritos from "./controladores/ControladorFavoritos.js";
import ControladorSesion from "./controladores/ControladorSesion.js";

// Raíz de composición: único lugar donde se decide qué instancias se comparten.
export default function crearContenedor({ fecha = () => new Date(), duracionSesionMs } = {}) {
  const repositorioUsuarios = new RepositorioUsuarios();
  const repositorioEventos = new RepositorioEventos();
  const repositorioCompras = new RepositorioCompras();
  const repositorioResenas = new RepositorioResenas();
  const repositorioSesiones = new RepositorioSesiones();

  const servicioAutenticacion = new ServicioAutenticacion({ repositorioUsuarios, repositorioSesiones, fecha, duracionSesionMs });
  const servicioEventos = new ServicioEventos({ repositorioEventos, repositorioUsuarios, repositorioCompras, repositorioResenas, fecha });
  const servicioFavoritos = new ServicioFavoritos({ repositorioUsuarios, repositorioEventos, repositorioResenas });
  const servicioCompras = new ServicioCompras({ repositorioCompras, repositorioEventos, repositorioUsuarios, repositorioResenas, fecha });

  return {
    fecha,
    repositorios: { repositorioUsuarios, repositorioEventos, repositorioCompras, repositorioResenas, repositorioSesiones },
    servicios: { servicioAutenticacion, servicioEventos, servicioFavoritos, servicioCompras },
    controladores: {
      controladorSesion: new ControladorSesion({ servicioAutenticacion }),
      controladorEventos: new ControladorEventos({ servicioEventos }),
      controladorFavoritos: new ControladorFavoritos({ servicioFavoritos }),
      controladorCompras: new ControladorCompras({ servicioCompras })
    }
  };
}
