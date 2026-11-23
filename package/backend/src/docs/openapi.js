const ref = nombre => ({ $ref: `#/components/schemas/${nombre}` });
const json = esquema => ({ "application/json": { schema: esquema } });
const respuestaJson = (descripcion, esquema) => ({ description: descripcion, content: json(esquema) });
const seguridad = [{ bearerAuth: [] }];
const errores = (...codigos) => Object.fromEntries(codigos.map(codigo => [codigo, { $ref: `#/components/responses/Error${codigo}` }]));
const parametroId = (nombre, descripcion) => ({ name: nombre, in: "path", required: true, description: descripcion, schema: { type: "string" } });
const parametroConsulta = (nombre, descripcion, schema = { type: "string" }) => ({ name: nombre, in: "query", description: descripcion, schema });

const operacionDeCompra = ({ resumen, descripcion, codigoOk = 200, errorEsperado = [403, 404, 409] }) => ({
  tags: ["Compras"],
  summary: resumen,
  description: descripcion,
  security: seguridad,
  parameters: [parametroId("id", "Identificador de la compra")],
  responses: {
    [codigoOk]: respuestaJson("Compra actualizada", { type: "object", properties: { compra: ref("CompraDetalle") } }),
    ...errores(401, ...errorEsperado)
  }
});

export const especificacionOpenApi = {
  openapi: "3.0.3",
  info: {
    title: "AI Ticket It - API",
    version: "1.0.0",
    description: "API REST de la plataforma de venta de entradas para eventos. Persistencia en memoria con datos de ejemplo (contraseña `demo1234`)."
  },
  servers: [{ url: "/api", description: "Servidor actual" }],
  tags: [
    { name: "Sesión", description: "Inicio y cierre de sesión" },
    { name: "Eventos", description: "Catálogo, búsqueda y publicación de eventos" },
    { name: "Favoritos", description: "Eventos favoritos del comprador" },
    { name: "Compras", description: "Compra de entradas, estados, chat y reseñas" }
  ],
  paths: {
    "/health": {
      get: { tags: ["Sesión"], summary: "Verifica que la API esté disponible", responses: { 200: respuestaJson("API disponible", { type: "object", properties: { status: { type: "string", example: "ok" } } }) } }
    },
    "/sesion": {
      post: {
        tags: ["Sesión"],
        summary: "Iniciar sesión",
        requestBody: { required: true, content: json(ref("CredencialesEntrada")) },
        responses: { 201: respuestaJson("Sesión creada", ref("SesionRespuesta")), ...errores(401) }
      },
      get: {
        tags: ["Sesión"], summary: "Obtener el usuario de la sesión actual", security: seguridad,
        responses: { 200: respuestaJson("Usuario autenticado", { type: "object", properties: { usuario: ref("Usuario") } }), ...errores(401) }
      },
      delete: { tags: ["Sesión"], summary: "Cerrar sesión", security: seguridad, responses: { 204: { description: "Sesión cerrada" }, ...errores(401) } }
    },
    "/categorias": {
      get: {
        tags: ["Eventos"], summary: "Listar las categorías de eventos", security: seguridad,
        responses: { 200: respuestaJson("Categorías", { type: "object", properties: { categorias: { type: "array", items: ref("Categoria") } } }), ...errores(401) }
      }
    },
    "/eventos": {
      get: {
        tags: ["Eventos"],
        summary: "Buscar y ordenar eventos futuros",
        description: "Casos de uso: búsqueda por texto, navegación por categoría, filtro por precio y ordenamiento por precio, fecha o puntaje del organizador.",
        security: seguridad,
        parameters: [
          parametroConsulta("busqueda", "Texto a buscar en nombre, descripción, ubicación y categoría"),
          parametroConsulta("categoria", "Nombre de la categoría"),
          parametroConsulta("precioMin", "Precio mínimo", { type: "number" }),
          parametroConsulta("precioMax", "Precio máximo", { type: "number" }),
          parametroConsulta("ordenar", "Criterio de orden", { type: "string", enum: ["precio", "fecha", "puntaje"], default: "fecha" }),
          parametroConsulta("direccion", "Dirección del orden", { type: "string", enum: ["asc", "desc"], default: "asc" })
        ],
        responses: { 200: respuestaJson("Eventos encontrados", { type: "object", properties: { eventos: { type: "array", items: ref("EventoResumen") } } }), ...errores(400, 401) }
      },
      post: {
        tags: ["Eventos"], summary: "Publicar un evento con varios tipos de entrada (organizador)", security: seguridad,
        requestBody: { required: true, content: json(ref("EventoEntrada")) },
        responses: { 201: respuestaJson("Evento publicado", { type: "object", properties: { evento: ref("EventoDetalle") } }), ...errores(400, 401, 403) }
      }
    },
    "/eventos/organizados": {
      get: {
        tags: ["Eventos"], summary: "Listar los eventos publicados por el organizador", security: seguridad,
        responses: { 200: respuestaJson("Eventos del organizador", { type: "object", properties: { eventos: { type: "array", items: ref("EventoResumen") } } }), ...errores(401, 403) }
      }
    },
    "/eventos/{id}": {
      get: {
        tags: ["Eventos"], summary: "Detalle de un evento con las reseñas de su organizador", security: seguridad,
        parameters: [parametroId("id", "Identificador del evento")],
        responses: { 200: respuestaJson("Detalle del evento", { type: "object", properties: { evento: ref("EventoDetalle") } }), ...errores(401, 404) }
      }
    },
    "/eventos/{id}/compras": {
      get: {
        tags: ["Eventos"], summary: "Compras de un evento con su estado y entradas disponibles por tipo (organizador)", security: seguridad,
        parameters: [parametroId("id", "Identificador del evento")],
        responses: {
          200: respuestaJson("Compras del evento", { type: "object", properties: { evento: ref("EventoResumen"), compras: { type: "array", items: ref("CompraResumen") } } }),
          ...errores(401, 403, 404)
        }
      }
    },
    "/favoritos": {
      get: {
        tags: ["Favoritos"], summary: "Listar los eventos favoritos", security: seguridad,
        responses: { 200: respuestaJson("Favoritos", { type: "object", properties: { eventos: { type: "array", items: ref("EventoResumen") } } }), ...errores(401) }
      }
    },
    "/favoritos/{eventoId}": {
      put: {
        tags: ["Favoritos"], summary: "Marcar un evento como favorito (comprador)", security: seguridad,
        parameters: [parametroId("eventoId", "Identificador del evento")],
        responses: { 200: respuestaJson("Evento marcado", { type: "object", properties: { evento: ref("EventoResumen") } }), ...errores(401, 403, 404) }
      },
      delete: {
        tags: ["Favoritos"], summary: "Quitar un evento de favoritos (comprador)", security: seguridad,
        parameters: [parametroId("eventoId", "Identificador del evento")],
        responses: { 200: respuestaJson("Evento desmarcado", { type: "object", properties: { evento: ref("EventoResumen") } }), ...errores(401, 403, 404) }
      }
    },
    "/compras": {
      post: {
        tags: ["Compras"], summary: "Comprar entradas de un tipo dentro del cupo disponible (comprador)", security: seguridad,
        requestBody: { required: true, content: json(ref("CompraEntrada")) },
        responses: { 201: respuestaJson("Compra creada en estado pendiente", { type: "object", properties: { compra: ref("CompraDetalle") } }), ...errores(400, 401, 403, 404, 409) }
      },
      get: {
        tags: ["Compras"], summary: "Listar mis compras con su estado y los días restantes si están confirmadas (comprador)", security: seguridad,
        responses: { 200: respuestaJson("Compras del comprador", { type: "object", properties: { compras: { type: "array", items: ref("CompraResumen") } } }), ...errores(401, 403) }
      }
    },
    "/compras/{id}": {
      get: {
        tags: ["Compras"], summary: "Detalle de una compra (comprador u organizador)", security: seguridad,
        parameters: [parametroId("id", "Identificador de la compra")],
        responses: { 200: respuestaJson("Detalle de la compra", { type: "object", properties: { compra: ref("CompraDetalle") } }), ...errores(401, 403, 404) }
      }
    },
    "/compras/{id}/pago": {
      post: operacionDeCompra({ resumen: "Pagar la compra (pasa de pendiente a confirmada)", descripcion: "El pago está simulado." })
    },
    "/compras/{id}/cancelacion": {
      post: operacionDeCompra({
        resumen: "Cancelar la compra",
        descripcion: "Una compra pendiente queda cancelada y una confirmada queda reembolsada. No se puede cancelar si la entrada fue utilizada o el evento ya se realizó."
      })
    },
    "/compras/{id}/utilizacion": {
      post: operacionDeCompra({ resumen: "Marcar la entrada como utilizada (organizador)", descripcion: "Solo para compras confirmadas." })
    },
    "/mensajes": {
      get: {
        tags: ["Compras"], summary: "Listar mis conversaciones: compras con mensajes, la más reciente primero (comprador u organizador)", security: seguridad,
        responses: { 200: respuestaJson("Conversaciones", { type: "object", properties: { conversaciones: { type: "array", items: ref("Conversacion") } } }), ...errores(401) }
      }
    },
    "/compras/{id}/mensajes": {
      get: {
        tags: ["Compras"], summary: "Listar los mensajes del chat de la compra", security: seguridad,
        parameters: [parametroId("id", "Identificador de la compra")],
        responses: { 200: respuestaJson("Mensajes", { type: "object", properties: { mensajes: { type: "array", items: ref("Mensaje") } } }), ...errores(401, 403, 404) }
      },
      post: {
        tags: ["Compras"], summary: "Enviar un mensaje en el chat de la compra (comprador u organizador)", security: seguridad,
        parameters: [parametroId("id", "Identificador de la compra")],
        requestBody: { required: true, content: json({ type: "object", required: ["mensaje"], properties: { mensaje: { type: "string", example: "Hola, tengo una consulta." } } }) },
        responses: { 201: respuestaJson("Mensaje enviado", { type: "object", properties: { mensaje: ref("Mensaje") } }), ...errores(400, 401, 403, 404) }
      }
    },
    "/compras/{id}/resena": {
      post: {
        tags: ["Compras"], summary: "Calificar el evento una vez utilizada la entrada (comprador)", security: seguridad,
        parameters: [parametroId("id", "Identificador de la compra")],
        requestBody: { required: true, content: json(ref("ResenaEntrada")) },
        responses: { 201: respuestaJson("Reseña creada", { type: "object", properties: { resena: ref("Resena") } }), ...errores(400, 401, 403, 404, 409) }
      }
    }
  },
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", description: "Token devuelto por POST /sesion" } },
    responses: {
      Error400: { description: "Datos inválidos", content: json(ref("Error")) },
      Error401: { description: "No autenticado", content: json(ref("Error")) },
      Error403: { description: "Sin permisos para esta acción", content: json(ref("Error")) },
      Error404: { description: "Recurso no encontrado", content: json(ref("Error")) },
      Error409: { description: "Regla de negocio incumplida", content: json(ref("Error")) }
    },
    schemas: {
      Error: { type: "object", properties: { mensaje: { type: "string" } } },
      CredencialesEntrada: {
        type: "object", required: ["correo", "clave"],
        properties: { correo: { type: "string", example: "ana@comprador.com" }, clave: { type: "string", example: "demo1234" } }
      },
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string" }, nombre: { type: "string" }, apellido: { type: "string" },
          correo: { type: "string" }, rol: { type: "string", enum: ["comprador", "organizador"] }
        }
      },
      SesionRespuesta: { type: "object", properties: { token: { type: "string" }, usuario: ref("Usuario") } },
      Categoria: { type: "object", properties: { id: { type: "string" }, nombre: { type: "string", example: "Música" } } },
      TipoEntrada: {
        type: "object",
        properties: {
          id: { type: "string" }, nombre: { type: "string" }, descripcion: { type: "string" },
          precio: { type: "number" }, cupo: { type: "integer" }, vendidas: { type: "integer" }, disponibles: { type: "integer" }
        }
      },
      TipoEntradaEntrada: {
        type: "object", required: ["nombre", "precio", "cupo"],
        properties: { nombre: { type: "string", example: "VIP" }, descripcion: { type: "string" }, precio: { type: "number", example: 35000 }, cupo: { type: "integer", example: 50 } }
      },
      EventoEntrada: {
        type: "object", required: ["nombre", "descripcion", "categoria", "fecha", "ubicacion", "tiposEntrada"],
        properties: {
          nombre: { type: "string", example: "Rock en vivo" },
          descripcion: { type: "string" },
          categoria: { type: "string", example: "Música" },
          fecha: { type: "string", format: "date-time" },
          ubicacion: { type: "string" },
          multimedia: { type: "array", items: { type: "string" }, description: "Enlaces a imágenes o videos" },
          tiposEntrada: { type: "array", items: ref("TipoEntradaEntrada") }
        }
      },
      OrganizadorResumen: {
        type: "object",
        properties: { id: { type: "string" }, nombre: { type: "string" }, apellido: { type: "string" }, puntaje: { type: "number", nullable: true }, cantidadResenas: { type: "integer" } }
      },
      EventoResumen: {
        type: "object",
        properties: {
          id: { type: "string" }, nombre: { type: "string" }, descripcion: { type: "string" }, categoria: ref("Categoria"),
          fecha: { type: "string", format: "date-time" }, ubicacion: { type: "string" },
          multimedia: { type: "array", items: { type: "string" } }, precioDesde: { type: "number" },
          tiposEntrada: { type: "array", items: ref("TipoEntrada") }, organizador: ref("OrganizadorResumen"), esFavorito: { type: "boolean" }
        }
      },
      EventoDetalle: {
        allOf: [ref("EventoResumen"), { type: "object", properties: { resenasOrganizador: { type: "array", items: ref("Resena") } } }]
      },
      CompraEntrada: {
        type: "object", required: ["eventoId", "tipoEntradaId", "cantidad"],
        properties: { eventoId: { type: "string" }, tipoEntradaId: { type: "string" }, cantidad: { type: "integer", minimum: 1, maximum: 10 } }
      },
      CompraResumen: {
        type: "object",
        properties: {
          id: { type: "string" }, estado: { type: "string", enum: ["pendiente", "confirmada", "utilizada", "cancelada", "reembolsada"] },
          cantidad: { type: "integer" }, total: { type: "number" }, creada: { type: "string", format: "date-time" },
          diasRestantes: { type: "integer", nullable: true, description: "Solo si la compra está confirmada" },
          comprador: ref("Usuario"),
          evento: { type: "object", properties: { id: { type: "string" }, nombre: { type: "string" }, fecha: { type: "string", format: "date-time" }, ubicacion: { type: "string" } } },
          tipoEntrada: { type: "object", properties: { id: { type: "string" }, nombre: { type: "string" }, precio: { type: "number" } } }
        }
      },
      CompraDetalle: {
        allOf: [ref("CompraResumen"), {
          type: "object",
          properties: {
            mensajes: { type: "array", items: ref("Mensaje") },
            historial: { type: "array", items: { type: "object", properties: { estado: { type: "string" }, fechaHora: { type: "string", format: "date-time" }, quien: ref("Usuario") } } },
            resena: { nullable: true, allOf: [ref("Resena")] },
            acciones: {
              type: "object",
              description: "Acciones permitidas para el usuario autenticado",
              properties: { pagar: { type: "boolean" }, cancelar: { type: "boolean" }, utilizar: { type: "boolean" }, calificar: { type: "boolean" }, enviarMensaje: { type: "boolean" } }
            }
          }
        }]
      },
      Mensaje: { type: "object", properties: { id: { type: "string" }, usuario: ref("Usuario"), mensaje: { type: "string" }, enviado: { type: "string", format: "date-time" } } },
      Conversacion: {
        type: "object",
        properties: {
          compraId: { type: "string" },
          evento: { type: "object", properties: { id: { type: "string" }, nombre: { type: "string" } } },
          interlocutor: ref("Usuario"),
          cantidadMensajes: { type: "integer" },
          ultimoMensaje: ref("Mensaje")
        }
      },
      ResenaEntrada: {
        type: "object", required: ["puntuacion", "detalle"],
        properties: { puntuacion: { type: "integer", minimum: 1, maximum: 5 }, detalle: { type: "string", example: "Excelente organización." } }
      },
      Resena: {
        type: "object",
        properties: {
          id: { type: "string" }, comprador: ref("Usuario"),
          evento: { type: "object", properties: { id: { type: "string" }, nombre: { type: "string" } } },
          puntuacion: { type: "integer" }, detalle: { type: "string" }, fecha: { type: "string", format: "date-time" }
        }
      }
    }
  }
};
