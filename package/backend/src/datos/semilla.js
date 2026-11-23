import Compra from "../dominio/Compra.js";
import Evento from "../dominio/Evento.js";
import Usuario from "../dominio/Usuario.js";
import { RolUsuario } from "../dominio/enums.js";

export const CLAVE_DE_EJEMPLO = "demo1234";

const DIA = 24 * 60 * 60 * 1000;

function datosDeEvento(organizador, ahora, { dias, ...datos }) {
  return { ...datos, organizador, fecha: new Date(ahora.getTime() + dias * DIA).toISOString() };
}

export async function cargarDatosDeEjemplo(contenedor) {
  const { repositorioUsuarios, repositorioEventos, repositorioCompras, repositorioResenas } = contenedor.repositorios;
  const ahora = contenedor.fecha();
  const haceDias = dias => new Date(ahora.getTime() - dias * DIA);

  const crearUsuario = (datos) => repositorioUsuarios.guardar(Usuario.crear({ ...datos, clave: CLAVE_DE_EJEMPLO }));
  const lucia = await crearUsuario({ nombre: "Lucía", apellido: "Gómez", correo: "lucia@organizador.com", rol: RolUsuario.ORGANIZADOR });
  const mateo = await crearUsuario({ nombre: "Mateo", apellido: "Ruiz", correo: "mateo@organizador.com", rol: RolUsuario.ORGANIZADOR });
  const ana = await crearUsuario({ nombre: "Ana", apellido: "Pérez", correo: "ana@comprador.com", rol: RolUsuario.COMPRADOR });
  const bruno = await crearUsuario({ nombre: "Bruno", apellido: "Díaz", correo: "bruno@comprador.com", rol: RolUsuario.COMPRADOR });
  const elias = await crearUsuario({ nombre: "Elias", apellido: "Costa", correo: "elias@comprador.com", rol: RolUsuario.COMPRADOR });

  const publicar = (organizador, momento, datos) =>
    repositorioEventos.guardar(Evento.publicar(datosDeEvento(organizador, momento, datos), momento));

  // Evento pasado de Lucía: genera reseñas que se muestran en sus eventos futuros.
  const momentoPasado = haceDias(40);
  const festivalPasado = await publicar(lucia, momentoPasado, {
    nombre: "Festival Primavera 2025",
    descripcion: "Edición anterior del festival de música en vivo.",
    categoria: "Festivales",
    ubicacion: "Parque Sarmiento, Córdoba",
    dias: 30,
    tiposEntrada: [{ nombre: "General", descripcion: "Acceso general", precio: 12000, cupo: 200 }]
  });
  const comprarYUtilizar = async (comprador, evento, cantidad, puntuacion, detalle) => {
    const compra = Compra.solicitar({ comprador, evento, tipoEntradaId: evento.tiposEntrada[0].id, cantidad, ahora: momentoPasado });
    compra.pagar(comprador, momentoPasado);
    const momentoEvento = new Date(evento.fecha.getTime() + 60 * 1000);
    compra.utilizar(evento.organizador, momentoEvento);
    await repositorioResenas.guardar(compra.calificar(comprador, { puntuacion, detalle }, momentoEvento));
    await repositorioCompras.guardar(compra);
  };
  await comprarYUtilizar(ana, festivalPasado, 2, 5, "Excelente organización y muy buen sonido.");
  await comprarYUtilizar(bruno, festivalPasado, 1, 4, "Muy buen clima, aunque había mucha fila en el ingreso.");

  const rockEnVivo = await publicar(lucia, ahora, {
    nombre: "Rock en vivo",
    descripcion: "Noche de bandas locales de rock y música alternativa.",
    categoria: "Música",
    ubicacion: "Teatro Vorterix, Buenos Aires",
    dias: 12,
    multimedia: ["https://picsum.photos/seed/rock/800/400"],
    tiposEntrada: [
      { nombre: "General", descripcion: "Acceso al campo", precio: 15000, cupo: 100 },
      { nombre: "VIP", descripcion: "Ubicación preferencial y barra libre", precio: 35000, cupo: 20 }
    ]
  });
  const festivalVerano = await publicar(lucia, ahora, {
    nombre: "Festival de Verano",
    descripcion: "Tres escenarios, comida y música electrónica toda la noche.",
    categoria: "Festivales",
    ubicacion: "Costanera Sur, Rosario",
    dias: 45,
    tiposEntrada: [
      { nombre: "Día 1", precio: 22000, cupo: 300 },
      { nombre: "Pase completo", descripcion: "Los tres días", precio: 55000, cupo: 150 }
    ]
  });
  const obra = await publicar(mateo, ahora, {
    nombre: "Hamlet",
    descripcion: "Clásico de Shakespeare en una versión contemporánea.",
    categoria: "Teatro",
    ubicacion: "Teatro San Martín, Buenos Aires",
    dias: 5,
    tiposEntrada: [
      { nombre: "Platea", precio: 18000, cupo: 60 },
      { nombre: "Pullman", precio: 12000, cupo: 40 }
    ]
  });
  await publicar(mateo, ahora, {
    nombre: "Final de la Liga de Fútbol",
    descripcion: "Partido decisivo del campeonato local.",
    categoria: "Deportes",
    ubicacion: "Estadio Mario Kempes, Córdoba",
    dias: 20,
    tiposEntrada: [{ nombre: "Popular", precio: 8000, cupo: 500 }, { nombre: "Platea", precio: 25000, cupo: 100 }]
  });
  await publicar(mateo, ahora, {
    nombre: "Cata de vinos y maridaje",
    descripcion: "Degustación guiada de cinco vinos con tapeo.",
    categoria: "Gastronomía",
    ubicacion: "Bodega Alta Vista, Mendoza",
    dias: 9,
    tiposEntrada: [{ nombre: "Entrada única", precio: 9500, cupo: 30 }]
  });

  const comprarYGuardar = async (comprador, evento, indiceTipo, cantidad) => {
    const compra = Compra.solicitar({ comprador, evento, tipoEntradaId: evento.tiposEntrada[indiceTipo].id, cantidad, ahora });
    await repositorioCompras.guardar(compra);
    await repositorioEventos.guardar(evento);
    return compra;
  };

  const compraConfirmada = await comprarYGuardar(ana, rockEnVivo, 0, 2);
  compraConfirmada.pagar(ana, ahora);
  compraConfirmada.enviarMensaje(ana, "Hola, ¿se puede ingresar con mochila?", ahora);
  compraConfirmada.enviarMensaje(lucia, "¡Hola Ana! Sí, mochilas pequeñas sin problema.", ahora);

  await comprarYGuardar(ana, obra, 0, 1);

  const compraCancelada = await comprarYGuardar(ana, festivalVerano, 1, 1);
  compraCancelada.pagar(ana, ahora);
  compraCancelada.cancelar(ana, ahora);

  const compraBruno = await comprarYGuardar(bruno, rockEnVivo, 1, 1);
  compraBruno.pagar(bruno, ahora);

  ana.agregarFavorito(obra);
  await repositorioUsuarios.guardar(ana);
}
