import api from "./api";

export const comprar = async datos => (await api.post("/compras", datos)).data;

export const listarMisCompras = async () => (await api.get("/compras")).data;

export const listarConversaciones = async () => (await api.get("/mensajes")).data;

export const obtenerCompra = async id => (await api.get(`/compras/${id}`)).data;

export const pagarCompra = async id => (await api.post(`/compras/${id}/pago`)).data;

export const cancelarCompra = async id => (await api.post(`/compras/${id}/cancelacion`)).data;

export const utilizarCompra = async id => (await api.post(`/compras/${id}/utilizacion`)).data;

export const enviarMensaje = async (id, mensaje) => (await api.post(`/compras/${id}/mensajes`, { mensaje })).data;

export const calificarCompra = async (id, datos) => (await api.post(`/compras/${id}/resena`, datos)).data;
