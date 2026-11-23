import "dotenv/config";
import crearApp from "./app.js";
import { leerConfiguracion } from "./config.js";
import crearContenedor from "./contenedor.js";
import { cargarDatosDeEjemplo } from "./datos/semilla.js";

const configuracion = leerConfiguracion();

const contenedor = crearContenedor({ duracionSesionMs: configuracion.duracionSesionMs });
if (configuracion.cargarDatosDeEjemplo) {
  await cargarDatosDeEjemplo(contenedor);
}

crearApp({ contenedor, origenesPermitidos: configuracion.origenesPermitidos })
  .listen(configuracion.puerto, configuracion.host, () => {
    console.log(`API escuchando en http://localhost:${configuracion.puerto}/api`);
    console.log(`Documentación Swagger en http://localhost:${configuracion.puerto}/api-docs`);
  });
