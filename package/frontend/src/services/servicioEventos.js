import api from "./api";

export const listarCategorias = async () => (await api.get("/categorias")).data;

export const buscarEventos = async filtros => (await api.get("/eventos", { params: filtros })).data;

export const obtenerEvento = async id => (await api.get(`/eventos/${id}`)).data;

export const publicarEvento = async datos => (await api.post("/eventos", datos)).data;

export const listarMisEventos = async () => (await api.get("/eventos/organizados")).data;

export const listarComprasDeEvento = async id => (await api.get(`/eventos/${id}/compras`)).data;
