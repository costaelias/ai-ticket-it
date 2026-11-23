import axios from "axios";
import { URL_API } from "../config";

let token = null;
let alExpirarSesion = null;

export const establecerToken = nuevoToken => {
  token = nuevoToken;
};

// El ProveedorSesion registra acá qué hacer cuando el backend responde 401.
export const establecerAlExpirarSesion = manejador => {
  alExpirarSesion = manejador;
};

const api = axios.create({ baseURL: URL_API, timeout: 8000 });

api.interceptors.request.use(config => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  respuesta => respuesta,
  error => {
    if (error.response?.status === 401 && token && alExpirarSesion) alExpirarSesion();
    return Promise.reject(error);
  }
);

export const mensajeDeError = error =>
  error.response
    ? error.response.data?.mensaje ?? "Ocurrió un error inesperado."
    : `No se pudo conectar con el servidor (${URL_API}). Verificá la URL de la API y que el backend esté levantado.`;

export default api;
