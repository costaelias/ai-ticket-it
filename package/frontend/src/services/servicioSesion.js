import api from "./api";

export const iniciarSesion = async (correo, clave) => (await api.post("/sesion", { correo, clave })).data;

export const cerrarSesion = async () => {
  await api.delete("/sesion");
};
