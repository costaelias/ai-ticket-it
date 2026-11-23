# AI Ticket It

Plataforma de venta de entradas para eventos (TP Individual de Desarrollo con IA — UTN DDS 2C 2026).
Compradores y organizadores operan sobre la misma API: los compradores buscan eventos, compran entradas, chatean con el organizador, cancelan y califican; los organizadores publican eventos con varios tipos de entrada y consultan las compras y la disponibilidad.

- `package/backend`: API REST con Node + Express (documentada con Swagger).
- `package/frontend`: app móvil con React Native (Expo).

La persistencia es **en memoria** (se carga una semilla de ejemplo al iniciar el servidor).

---

## Arquitectura

### Backend (`package/backend/src`)

```
Ruta → Middleware → Controlador → Servicio → Dominio ← Repositorio
```

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Dominio | `dominio/` | **Toda la lógica de negocio**: `Compra`, `Evento`, `Catalogo`, `Usuario`, `TipoEntrada`, `Resena`, `Reputacion`, `Mensaje`, `Sesion`, `CambioEstadoCompra`. Valida reglas, transiciones de estado, roles y cupos. |
| Repositorios | `repositorios/` | Guardan y recuperan entidades (en memoria). |
| Servicios | `servicios/` | Solo **orquestan casos de uso**: cargar entidades, invocar al dominio, guardar. No contienen reglas. |
| Controladores | `controladores/` | Traducen HTTP ↔ servicio (parámetros, códigos de respuesta). |
| Rutas / Middleware | `rutas/`, `middleware/` | Enrutado, autenticación por token Bearer y manejo de errores. |
| Composición | `contenedor.js` | Único lugar donde se instancian y conectan las dependencias. |
| Docs | `docs/openapi.js` | Especificación OpenAPI servida con Swagger UI. |

**Asincronía:** los repositorios, servicios, controladores y el middleware de autenticación son `async` (devuelven Promesas y se encadenan con `await`), como lo serían contra una base de datos real. Las clases de dominio permanecen síncronas porque solo contienen reglas de negocio, sin I/O. Cada controlador y el middleware de autenticación capturan los errores con `try/catch` y los delegan con `next(error)` al middleware de errores (`manejarErrores`), que los traduce a respuestas HTTP.

**Inyección de dependencias:** cada servicio y controlador recibe sus dependencias por constructor y define un **valor por defecto** para cada una (p. ej. `constructor({ repositorioCompras = new RepositorioCompras(), fecha = () => new Date() } = {})`). Los tests reemplazan dependencias (como la fecha) sin tocar el código.

**Validación en constructores:** cada clase de dominio valida en su constructor los campos obligatorios, tipos, rangos y relaciones (p. ej. un `Evento` no puede crearse sin organizador con rol organizador ni sin tipos de entrada; una `Compra` exige un tipo de entrada del propio evento y una cantidad entre 1 y 10). Así ninguna entidad puede existir en un estado inválido, se construya por la API, por la semilla o por un test.

**Patrones de diseño aplicados en el dominio**
- *Factory Method*: `Evento.publicar`, `Compra.solicitar`, `Usuario.crear` y `Sesion.iniciar` encapsulan las reglas de alta.
- *State*: `EstadosCompra.js` modela `pendiente`, `confirmada`, `utilizada`, `cancelada` y `reembolsada` como objetos que deciden qué operaciones admiten y a qué estado pasan (`Compra` delega en su estado, sin cadenas de `if`).
- *Strategy*: `OrdenDeEventos.js` define un criterio de orden por precio, fecha o puntaje, intercambiable desde `Catalogo.buscar`.
- *Value Object*: `Categoria` es un catálogo cerrado e inmutable de categorías.

**Reglas principales del dominio**
- `Compra`: reserva cupo al solicitar (máx. 10 entradas por compra), `pendiente → confirmada` al pagar, cancelar una pendiente la pasa a `cancelada` y una confirmada a `reembolsada` (libera cupo); no se cancela una compra utilizada ni de un evento ya realizado; solo el organizador marca `utilizada`; se califica una única vez y solo si fue utilizada; `diasRestantes` solo aplica a compras confirmadas.
- `Evento`: lo publica un organizador, con fecha futura, al menos un tipo de entrada y nombres de tipo únicos.
- `Catalogo`: solo eventos futuros; filtra por texto, categoría y rango de precio; ordena por precio, fecha o puntaje.
- `Reputacion`: promedio de reseñas del organizador.

### Frontend (`package/frontend/src`)

| Carpeta | Contenido |
|---|---|
| `services/` | Llamadas a la API. `api.js` define el cliente común (axios con URL base, token e interceptor de sesión expirada) y cada service (`servicioSesion`, `servicioEventos`, `servicioFavoritos`, `servicioCompras`) exporta una función por endpoint que reutiliza ese cliente. |
| `hooks/` | Lógica de presentación y estado (`useBusquedaEventos`, `useMisCompras`, `useDetalleCompra`, `useCrearEvento`, …): cada hook usa `useState`/`useEffect` y llama directamente a las funciones del service. |
| `components/ui/` | Componentes atómicos reutilizables (`Boton`, `CampoTexto`, `Pagina`, `InsigniaEstado`, `TextoError`, …). |
| `components/` | Componentes de dominio (`TarjetaEvento`, `TarjetaCompra`, `ChatCompra`, `SelectorEntradas`, `ListaResenas`, …). |
| `screens/` | Una pantalla por archivo: `comprador/`, `organizador/`, `compartidas/` y `PantallaInicioSesion`. |
| `navigation/` | Navegación por pestañas según el rol, pila de pantallas y manejo del botón físico de retroceso (`BackHandler`). |
| `context/` | `ProveedorSesion` (usuario autenticado). |

---

## Puesta en marcha

### Backend

```bash
cd package/backend
npm install
npm run dev        # o npm start  → http://localhost:4000
npm test           # tests de dominio y de la API
```

- Swagger UI: <http://localhost:4000/api-docs> (JSON en `/api/docs.json`).
- Variables de entorno en `package/backend/.env` (hay una plantilla en `.env.example`):

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `4000` | Puerto de la API |
| `HOST` | `0.0.0.0` | Interfaz de red (permite conectar desde emulador o celular) |
| `CORS_ORIGINS` | `*` | Orígenes permitidos, separados por coma |
| `DURACION_SESION_HORAS` | `8` | Vigencia del token de sesión |
| `CARGAR_DATOS_EJEMPLO` | `true` | Carga los datos de ejemplo al iniciar |
- Para probar en Swagger: `POST /api/sesion`, copiar el `token` y usar **Authorize**.

### Frontend

```bash
cd package/frontend
npm install
npx expo start     # Expo Go, emulador (a / i) o web (w)
```

La URL de la API se toma de `EXPO_PUBLIC_API_URL` en `package/frontend/.env` (plantilla en `.env.example`; con o sin el sufijo `/api`). Expo lee el archivo al iniciar el empaquetador, por lo que hay que reiniciar con `npx expo start -c` después de cambiarlo. Por defecto: `http://10.0.2.2:4000` en el emulador de Android y `http://localhost:4000` en el resto. En un celular físico usá la IP de tu PC en la red local, p. ej. `EXPO_PUBLIC_API_URL=http://192.168.0.10:4000`. Para probar dos usuarios a la vez (comprador y organizador) se pueden abrir dos emuladores Android distintos: ambos comparten el mismo backend y el mismo servidor de Expo, y en cada uno se abre `exp://10.0.2.2:8081` desde Expo Go.

### Usuarios de ejemplo (clave `demo1234`)

| Rol | Correo |
|---|---|
| Comprador | `ana@comprador.com`, `bruno@comprador.com` |
| Organizador | `lucia@organizador.com`, `mateo@organizador.com` |

Ana ya tiene compras en estado confirmada, pendiente, reembolsada y utilizada, un chat en una compra y un favorito, para recorrer todos los casos de uso. Estos usuarios se cargan solos cada vez que se ejecuta `npm run dev` o `npm start` en el backend (se desactiva con `CARGAR_DATOS_EJEMPLO=false`). En la app se ingresa escribiendo correo y clave: la pantalla de inicio envía las credenciales a `POST /api/sesion`.

---

## Casos de uso y endpoints

Todos los endpoints cuelgan de `/api` y requieren `Authorization: Bearer <token>`, salvo `GET /health` y `POST /sesion`.

| # | Caso de uso | Endpoints | Frontend (pantalla / hook) |
|---|---|---|---|
| 0 | Iniciar / cerrar sesión | `POST /sesion`, `GET /sesion`, `DELETE /sesion` | `PantallaInicioSesion` / `ProveedorSesion` |
| 1 | Comprador: ver sus compras con estado y días restantes | `GET /compras`, `GET /compras/{id}` | `PantallaMisCompras` / `useMisCompras` |
| 2 | Organizador: ver las compras de un evento y la disponibilidad por tipo de entrada | `GET /eventos/organizados`, `GET /eventos/{id}/compras` | `PantallaMisEventos`, `PantallaComprasEvento` / `useMisEventos`, `useComprasDeEvento` |
| 3 | Buscar eventos por texto y filtrar por categoría | `GET /categorias`, `GET /eventos?busqueda=&categoria=` | `PantallaEventos` / `useBusquedaEventos` |
| 4 | Crear un evento con múltiples tipos de entrada | `POST /eventos`, `GET /categorias` | `PantallaCrearEvento` / `useCrearEvento` |
| 5 | Comprador: enviar mensajes al organizador sobre una compra | `GET /compras/{id}/mensajes`, `POST /compras/{id}/mensajes` | `PantallaDetalleCompra` (`ChatCompra`) / `useDetalleCompra` |
| 6 | Organizador: responder mensajes de una compra | `GET /compras/{id}/mensajes`, `POST /compras/{id}/mensajes` | `PantallaDetalleCompra` (`ChatCompra`) |
| 7 | Comprador: cancelar una compra pendiente | `POST /compras/{id}/cancelacion` | `PantallaDetalleCompra` / `useDetalleCompra` |
| 8 | Comprador: cancelar una compra confirmada con reembolso | `POST /compras/{id}/cancelacion` | `PantallaDetalleCompra` / `useDetalleCompra` |
| 9 | Calificar al organizador tras usar la entrada | `POST /compras/{id}/resena` (previo: `POST /compras/{id}/utilizacion`, organizador) | `FormularioResena` en `PantallaDetalleCompra` |
| 10 | Ver las reseñas y el puntaje del organizador | `GET /eventos/{id}` (`resenasOrganizador` y puntaje del organizador) | `PantallaDetalleEvento` (`ListaResenas`) / `useDetalleEvento` |
| 11 | Ordenar eventos por precio, fecha o puntaje | `GET /eventos?ordenar=precio\|fecha\|puntaje&direccion=asc\|desc&precioMin=&precioMax=` | `PantallaEventos` (`FiltrosEventos`) |
| 12 | Comprar entradas por tipo y cantidad dentro del cupo | `GET /eventos/{id}`, `POST /compras`, `POST /compras/{id}/pago` | `PantallaDetalleEvento` (`SelectorEntradas`) / `useDetalleEvento` |
| + | Bandeja de mensajes (acceso rápido, comprador y organizador) | `GET /mensajes` (luego `GET/POST /compras/{id}/mensajes`) | `PantallaMensajes` (`TarjetaConversacion`) / `useConversaciones` |
| + | Favoritos | `GET /favoritos`, `PUT /favoritos/{eventoId}`, `DELETE /favoritos/{eventoId}` | `PantallaFavoritos` / `useFavoritos` |
| + | Estado del servidor | `GET /health` | — |

Errores: `{ "mensaje": "..." }` con estado `400` (validación), `401` (sin sesión), `403` (rol/propiedad), `404` (no existe) o `409` (conflicto de estado o cupo).

### Estados de una compra

```
pendiente ──pagar──▶ confirmada ──utilizar (organizador)──▶ utilizada ──calificar──▶ (reseña)
    │                    │
 cancelar             cancelar
    ▼                    ▼
cancelada            reembolsada
```

---

## Supuestos

- Persistencia en memoria: los datos se reinician al reiniciar el servidor.
- Login mínimo con usuarios de ejemplo (sin registro).
- El pago es simulado (`POST /compras/{id}/pago`).
- Los favoritos se incluyen porque forman parte del modelo del enunciado.
- La fecha del evento se carga como texto (`AAAA-MM-DD` y `HH:mm`).
