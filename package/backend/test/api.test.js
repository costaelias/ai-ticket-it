import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import crearApp from "../src/app.js";
import crearContenedor from "../src/contenedor.js";
import { CLAVE_DE_EJEMPLO, cargarDatosDeEjemplo } from "../src/datos/semilla.js";
import RepositorioUsuarios from "../src/repositorios/RepositorioUsuarios.js";
import ServicioAutenticacion from "../src/servicios/ServicioAutenticacion.js";

describe("API HTTP", () => {
  let servidor;
  let base;

  before(async () => {
    const contenedor = crearContenedor();
    await cargarDatosDeEjemplo(contenedor);
    servidor = crearApp({ contenedor }).listen(0);
    await new Promise(resolver => servidor.once("listening", resolver));
    base = `http://localhost:${servidor.address().port}/api`;
  });

  after(() => servidor.close());

  const pedir = async (ruta, { metodo = "GET", token, cuerpo } = {}) => {
    const respuesta = await fetch(`${base}${ruta}`, {
      method: metodo,
      headers: {
        ...(cuerpo ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    const texto = await respuesta.text();
    return { estado: respuesta.status, datos: texto ? JSON.parse(texto) : null };
  };
  const ingresar = async correo => (await pedir("/sesion", { metodo: "POST", cuerpo: { correo, clave: CLAVE_DE_EJEMPLO } })).datos.token;

  it("rechaza peticiones sin sesión y credenciales incorrectas", async () => {
    assert.equal((await pedir("/compras")).estado, 401);
    const { estado } = await pedir("/sesion", { metodo: "POST", cuerpo: { correo: "ana@comprador.com", clave: "mal" } });
    assert.equal(estado, 401);
  });

  it("recorre el flujo de compra, uso de la entrada y reseña", async () => {
    const comprador = await ingresar("bruno@comprador.com");
    const organizador = await ingresar("mateo@organizador.com");

    const { datos: busqueda } = await pedir("/eventos?busqueda=hamlet", { token: comprador });
    const evento = busqueda.eventos[0];
    const tipo = evento.tiposEntrada[1];

    const { estado: estadoCompra, datos: creada } = await pedir("/compras", {
      metodo: "POST", token: comprador, cuerpo: { eventoId: evento.id, tipoEntradaId: tipo.id, cantidad: 2 }
    });
    assert.equal(estadoCompra, 201);
    assert.equal(creada.compra.estado, "pendiente");
    const idCompra = creada.compra.id;

    const pago = await pedir(`/compras/${idCompra}/pago`, { metodo: "POST", token: comprador });
    assert.equal(pago.datos.compra.estado, "confirmada");
    assert.equal(pago.datos.compra.diasRestantes, 5);

    await pedir(`/compras/${idCompra}/mensajes`, { metodo: "POST", token: comprador, cuerpo: { mensaje: "Hola" } });
    const respuestaOrganizador = await pedir(`/compras/${idCompra}/mensajes`, { metodo: "POST", token: organizador, cuerpo: { mensaje: "Hola Bruno" } });
    assert.equal(respuestaOrganizador.estado, 201);
    assert.equal((await pedir(`/compras/${idCompra}/mensajes`, { token: comprador })).datos.mensajes.length, 2);

    assert.equal((await pedir(`/compras/${idCompra}/utilizacion`, { metodo: "POST", token: comprador })).estado, 403);
    assert.equal((await pedir(`/compras/${idCompra}/utilizacion`, { metodo: "POST", token: organizador })).datos.compra.estado, "utilizada");
    assert.equal((await pedir(`/compras/${idCompra}/cancelacion`, { metodo: "POST", token: comprador })).estado, 409);

    const resena = await pedir(`/compras/${idCompra}/resena`, { metodo: "POST", token: comprador, cuerpo: { puntuacion: 5, detalle: "Genial" } });
    assert.equal(resena.estado, 201);
    const detalle = await pedir(`/eventos/${evento.id}`, { token: comprador });
    assert.equal(detalle.datos.evento.resenasOrganizador.length, 1);
    assert.equal(detalle.datos.evento.organizador.puntaje, 5);
  });

  it("no permite que un organizador compre ni que otro comprador vea una compra ajena", async () => {
    const organizador = await ingresar("lucia@organizador.com");
    const { datos } = await pedir("/eventos/organizados", { token: organizador });
    const evento = datos.eventos[0];
    const compra = await pedir("/compras", {
      metodo: "POST", token: organizador, cuerpo: { eventoId: evento.id, tipoEntradaId: evento.tiposEntrada[0].id, cantidad: 1 }
    });
    assert.equal(compra.estado, 403);

    const ana = await ingresar("ana@comprador.com");
    const bruno = await ingresar("bruno@comprador.com");
    const [propia] = (await pedir("/compras", { token: ana })).datos.compras;
    assert.equal((await pedir(`/compras/${propia.id}`, { token: bruno })).estado, 403);
  });

  it("lista las conversaciones de cada participante con el último mensaje", async () => {
    const ana = await ingresar("ana@comprador.com");
    const lucia = await ingresar("lucia@organizador.com");
    const mateo = await ingresar("mateo@organizador.com");

    const deAna = (await pedir("/mensajes", { token: ana })).datos.conversaciones;
    assert.equal(deAna.length, 1);
    assert.equal(deAna[0].interlocutor.nombre, "Lucía");
    assert.equal(deAna[0].cantidadMensajes, 2);

    const deLucia = (await pedir("/mensajes", { token: lucia })).datos.conversaciones;
    assert.ok(deLucia.some(conversacion => conversacion.interlocutor.nombre === "Ana"));
    assert.ok((await pedir("/mensajes", { token: mateo })).datos.conversaciones.every(conversacion => conversacion.interlocutor.nombre === "Bruno"));
    assert.equal((await pedir("/mensajes")).estado, 401);
  });

  it("publica un evento con varios tipos de entrada y lo muestra en la búsqueda", async () => {
    const organizador = await ingresar("mateo@organizador.com");
    const { estado } = await pedir("/eventos", {
      metodo: "POST", token: organizador, cuerpo: {
        nombre: "Conferencia de IA", descripcion: "Charlas", categoria: "Conferencias", ubicacion: "Online",
        fecha: new Date(Date.now() + 7 * 86400000).toISOString(),
        tiposEntrada: [{ nombre: "Virtual", precio: 0, cupo: 100 }, { nombre: "Presencial", precio: 5000, cupo: 30 }]
      }
    });
    assert.equal(estado, 201);
    const { datos } = await pedir("/eventos?categoria=Conferencias&ordenar=precio", { token: organizador });
    assert.equal(datos.eventos[0].tiposEntrada.length, 2);
  });
});

describe("Inyección de dependencias", () => {
  it("cada servicio funciona con los valores por defecto de su constructor", async () => {
    const servicio = new ServicioAutenticacion();
    assert.ok(servicio.repositorioUsuarios instanceof RepositorioUsuarios);
    await assert.rejects(servicio.iniciarSesion({ correo: "nadie@x.com", clave: "x" }));
  });
});
