import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Catalogo from "../src/dominio/Catalogo.js";
import Compra from "../src/dominio/Compra.js";
import Evento from "../src/dominio/Evento.js";
import Mensaje from "../src/dominio/Mensaje.js";
import Resena from "../src/dominio/Resena.js";
import TipoEntrada from "../src/dominio/TipoEntrada.js";
import Usuario from "../src/dominio/Usuario.js";
import { EstadoCompra, RolUsuario } from "../src/dominio/enums.js";
import { Forbidden, Conflict, BadRequest } from "../src/dominio/errores.js";

const DIA = 24 * 60 * 60 * 1000;
const ahora = new Date("2026-06-01T12:00:00Z");
const enDias = dias => new Date(ahora.getTime() + dias * DIA).toISOString();

const usuario = (rol, nombre = "Usuario") =>
  Usuario.crear({ nombre, apellido: "Prueba", correo: `${nombre}@prueba.com`, clave: "clave1234", rol });

function publicarEvento(organizador, { dias = 10, precios = [1000, 5000], cupo = 5, ...resto } = {}) {
  return Evento.publicar({
    nombre: "Evento de prueba",
    descripcion: "Descripción",
    categoria: "Música",
    ubicacion: "Buenos Aires",
    fecha: enDias(dias),
    tiposEntrada: precios.map((precio, indice) => ({ nombre: `Tipo ${indice}`, precio, cupo })),
    organizador,
    ...resto
  }, ahora);
}

describe("Evento", () => {
  it("exige rol organizador, fecha futura y al menos un tipo de entrada", () => {
    const comprador = usuario(RolUsuario.COMPRADOR);
    assert.throws(() => publicarEvento(comprador), Forbidden);
    const organizador = usuario(RolUsuario.ORGANIZADOR);
    assert.throws(() => publicarEvento(organizador, { dias: -1 }), BadRequest);
    assert.throws(() => publicarEvento(organizador, { precios: [] }), BadRequest);
  });

  it("rechaza tipos de entrada con el mismo nombre", () => {
    const organizador = usuario(RolUsuario.ORGANIZADOR);
    assert.throws(() => publicarEvento(organizador, {
      tiposEntrada: [{ nombre: "VIP", precio: 1, cupo: 1 }, { nombre: "vip", precio: 2, cupo: 1 }]
    }), BadRequest);
  });
});

describe("Compra", () => {
  const preparar = () => {
    const organizador = usuario(RolUsuario.ORGANIZADOR, "Org");
    const comprador = usuario(RolUsuario.COMPRADOR, "Comp");
    const evento = publicarEvento(organizador);
    const compra = Compra.solicitar({ comprador, evento, tipoEntradaId: evento.tiposEntrada[0].id, cantidad: 2, ahora });
    return { organizador, comprador, evento, compra };
  };

  it("reserva cupo y calcula el total; no permite superar el cupo", () => {
    const { comprador, evento, compra } = preparar();
    assert.equal(compra.total, 2000);
    assert.equal(compra.estado, EstadoCompra.PENDIENTE);
    assert.equal(evento.tiposEntrada[0].disponibles(), 3);
    assert.throws(
      () => Compra.solicitar({ comprador, evento, tipoEntradaId: evento.tiposEntrada[0].id, cantidad: 4, ahora }),
      Conflict
    );
  });

  it("calcula los días restantes solo cuando está confirmada", () => {
    const { comprador, compra } = preparar();
    assert.equal(compra.diasRestantes(ahora), null);
    compra.pagar(comprador, ahora);
    assert.equal(compra.diasRestantes(ahora), 10);
  });

  it("cancelar una compra confirmada la reembolsa y libera el cupo", () => {
    const { comprador, evento, compra } = preparar();
    compra.pagar(comprador, ahora);
    compra.cancelar(comprador, ahora);
    assert.equal(compra.estado, EstadoCompra.REEMBOLSADA);
    assert.equal(evento.tiposEntrada[0].disponibles(), 5);
  });

  it("no se puede cancelar si fue utilizada o si el evento ya se realizó", () => {
    const { organizador, comprador, evento, compra } = preparar();
    compra.pagar(comprador, ahora);
    assert.throws(() => compra.cancelar(comprador, new Date(evento.fecha.getTime() + 1)), Conflict);
    compra.utilizar(organizador, ahora);
    assert.throws(() => compra.cancelar(comprador, ahora), Conflict);
  });

  it("solo el organizador utiliza la entrada", () => {
    const { comprador, compra } = preparar();
    compra.pagar(comprador, ahora);
    assert.throws(() => compra.utilizar(comprador, ahora), Forbidden);
  });

  it("solo se califica una vez y después de utilizar la entrada", () => {
    const { organizador, comprador, compra } = preparar();
    compra.pagar(comprador, ahora);
    assert.throws(() => compra.calificar(comprador, { puntuacion: 5, detalle: "Bien" }, ahora), Conflict);
    compra.utilizar(organizador, ahora);
    assert.throws(() => compra.calificar(comprador, { puntuacion: 9, detalle: "Bien" }, ahora), BadRequest);
    compra.calificar(comprador, { puntuacion: 5, detalle: "Muy bien" }, ahora);
    assert.throws(() => compra.calificar(comprador, { puntuacion: 4, detalle: "Otra" }, ahora), Conflict);
  });

  it("el chat queda restringido a comprador y organizador", () => {
    const { comprador, compra } = preparar();
    compra.enviarMensaje(comprador, "Hola", ahora);
    assert.equal(compra.mensajes.length, 1);
    assert.throws(() => compra.enviarMensaje(usuario(RolUsuario.COMPRADOR, "Ajeno"), "Hola", ahora), Forbidden);
  });
});

describe("Catalogo", () => {
  it("filtra eventos pasados y ordena por precio, fecha y puntaje", () => {
    const organizador = usuario(RolUsuario.ORGANIZADOR);
    const barato = publicarEvento(organizador, { dias: 20, precios: [100] });
    const caro = publicarEvento(organizador, { dias: 5, precios: [900] });
    const pasado = publicarEvento(organizador, { dias: 1 });
    const catalogo = new Catalogo({ eventos: [barato, caro, pasado] });
    const despues = new Date(ahora.getTime() + 2 * DIA);

    assert.deepEqual(catalogo.buscar({ ordenar: "precio" }, despues), [barato, caro]);
    assert.deepEqual(catalogo.buscar({ ordenar: "fecha" }, despues), [caro, barato]);
    assert.deepEqual(catalogo.buscar({ ordenar: "precio", direccion: "desc" }, despues), [caro, barato]);
    assert.deepEqual(catalogo.buscar({ precioMin: 500 }, despues), [caro]);
    assert.throws(() => catalogo.buscar({ ordenar: "inexistente" }, despues), BadRequest);
  });
});

describe("Validaciones de los constructores", () => {
  it("Usuario exige nombre, correo con formato, hash de clave y rol válido", () => {
    const datos = { nombre: "Ana", apellido: "Gómez", correo: "ana@prueba.com", claveHash: "sal:hash", rol: RolUsuario.COMPRADOR };
    assert.equal(new Usuario(datos).correo, "ana@prueba.com");
    assert.throws(() => new Usuario({ ...datos, nombre: "" }), BadRequest);
    assert.throws(() => new Usuario({ ...datos, correo: "sin-arroba" }), BadRequest);
    assert.throws(() => new Usuario({ ...datos, claveHash: undefined }), BadRequest);
    assert.throws(() => new Usuario({ ...datos, rol: "admin" }), BadRequest);
    assert.throws(() => Usuario.crear({ ...datos, clave: "123" }), BadRequest);
  });

  it("TipoEntrada y Evento rechazan datos incompletos o inconsistentes", () => {
    const organizador = usuario(RolUsuario.ORGANIZADOR);
    const evento = publicarEvento(organizador);
    assert.throws(() => new TipoEntrada({ nombre: "VIP", precio: -1, cupo: 10 }), BadRequest);
    assert.throws(() => new TipoEntrada({ nombre: "VIP", precio: 10, cupo: 5, vendidas: 6 }), BadRequest);
    assert.throws(() => new Evento({ ...evento, nombre: "" }), BadRequest);
    assert.throws(() => new Evento({ ...evento, organizador: usuario(RolUsuario.COMPRADOR) }), Forbidden);
    assert.throws(() => new Evento({ ...evento, tiposEntrada: [] }), BadRequest);
  });

  it("Compra, Mensaje y Resena exigen sus datos obligatorios", () => {
    const organizador = usuario(RolUsuario.ORGANIZADOR, "Org");
    const comprador = usuario(RolUsuario.COMPRADOR, "Comp");
    const evento = publicarEvento(organizador);
    const tipoEntrada = evento.tiposEntrada[0];
    assert.throws(() => new Compra({ comprador, evento, tipoEntrada, cantidad: 0, creada: ahora }), BadRequest);
    assert.throws(() => new Compra({ comprador, evento, tipoEntrada: new TipoEntrada({ nombre: "Otro", precio: 1, cupo: 1 }), cantidad: 1, creada: ahora }), BadRequest);
    assert.throws(() => new Compra({ comprador: organizador, evento, tipoEntrada, cantidad: 1, creada: ahora }), Forbidden);
    assert.throws(() => new Mensaje({ usuario: comprador, mensaje: " ", enviado: ahora }), BadRequest);
    assert.throws(() => new Resena({ comprador, evento, puntuacion: 6, detalle: "Bien", fecha: ahora }), BadRequest);
    assert.throws(() => new Resena({ comprador, evento, detalle: "Bien", fecha: ahora }), BadRequest);
  });
});
