import api from "./api";

export const listarFavoritos = async () => (await api.get("/favoritos")).data;

export const agregarFavorito = async eventoId => (await api.put(`/favoritos/${eventoId}`)).data;

export const quitarFavorito = async eventoId => (await api.delete(`/favoritos/${eventoId}`)).data;
