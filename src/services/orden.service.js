import { request } from "../api/api";
export const getOrdenes    = ()          => request("/ordenes", "GET");
export const getOrden      = (id)        => request(`/ordenes/${id}`, "GET");
export const createOrden   = (data)      => request("/ordenes", "POST", data);
export const cambiarEstado = (id, estado)=> request(`/ordenes/${id}/estado`, "PATCH", { estado });
export const recibirOC     = (id, recepciones) => request(`/ordenes/${id}/recibir`, "POST", { recepciones });
export const cancelarOrden = (id)        => request(`/ordenes/${id}/cancelar`, "PATCH");
