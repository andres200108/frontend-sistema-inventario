import { request } from "../api/api";

export const getClientes = async () => {
  return await request("/clientes", "GET");
};

export const getClientesActivos = async () => {
  return await request("/clientes/activos", "GET");
};

export const getCliente = async (id) => {
  return await request(`/clientes/${id}`, "GET");
};

export const createCliente = async (data) => {
  return await request("/clientes", "POST", data);
};

export const updateCliente = async (id, data) => {
  return await request(`/clientes/${id}`, "PUT", data);
};

export const desactivarCliente = async (id) => {
  return await request(`/clientes/${id}/desactivar`, "PATCH");
};

export const getHistorialCliente = async (id, filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.desde) params.append('desde', filtros.desde);
  if (filtros.hasta) params.append('hasta', filtros.hasta);
  if (filtros.producto) params.append('producto', filtros.producto);
  const query = params.toString() ? `?${params.toString()}` : '';
  return await request(`/clientes/${id}/historial${query}`, "GET");
};
