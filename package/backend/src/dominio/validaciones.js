import { BadRequest } from "./errores.js";

export function textoRequerido(valor, campo, { min = 1, max = 500 } = {}) {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new BadRequest(`${campo} es obligatorio.`);
  }
  const texto = valor.trim();
  if (texto.length < min) {
    throw new BadRequest(`${campo} debe tener al menos ${min} caracteres.`);
  }
  if (texto.length > max) {
    throw new BadRequest(`${campo} no puede superar los ${max} caracteres.`);
  }
  return texto;
}

export function textoOpcional(valor, campo, { max = 500 } = {}) {
  if (valor === undefined || valor === null || valor === "") return "";
  return textoRequerido(valor, campo, { max });
}

export function enteroEnRango(valor, campo, { min, max = Number.MAX_SAFE_INTEGER }) {
  if (!Number.isInteger(valor) || valor < min || valor > max) {
    throw new BadRequest(`${campo} debe ser un número entero entre ${min} y ${max}.`);
  }
  return valor;
}

export function numeroEnRango(valor, campo, { min, max = Number.MAX_SAFE_INTEGER }) {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor < min || valor > max) {
    throw new BadRequest(`${campo} debe ser un número entre ${min} y ${max}.`);
  }
  return valor;
}

export function fechaValida(valor, campo) {
  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (valor === undefined || valor === null || Number.isNaN(fecha.getTime())) {
    throw new BadRequest(`${campo} no es una fecha válida.`);
  }
  return fecha;
}

export function instanciaDe(valor, Clase, campo) {
  if (!(valor instanceof Clase)) {
    throw new BadRequest(`${campo} es obligatorio.`);
  }
  return valor;
}

export function valorDeEnum(valor, enumeracion, campo) {
  const validos = Object.values(enumeracion);
  if (!validos.includes(valor)) {
    throw new BadRequest(`${campo} debe ser uno de: ${validos.join(", ")}.`);
  }
  return valor;
}

export function listaDe(valor, campo) {
  if (!Array.isArray(valor)) {
    throw new BadRequest(`${campo} debe ser una lista.`);
  }
  return valor;
}

export function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
