import { request } from "../api/api";

export const getProveedores = async () => {
  return await request("/proveedores", "GET");
};

export const getProveedoresActivos = async () => {
  return await request("/proveedores/activos", "GET");
};

export const getProveedor = async (id) => {
  return await request(`/proveedores/${id}`, "GET");
};

export const createProveedor = async (data) => {
  return await request("/proveedores", "POST", data);
};

export const updateProveedor = async (id, data) => {
  return await request(`/proveedores/${id}`, "PUT", data);
};

export const desactivarProveedor = async (id) => {
  return await request(`/proveedores/${id}/desactivar`, "PATCH");
};

export const getHistorialProveedor = async (id, filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.desde) params.append('desde', filtros.desde);
  if (filtros.hasta) params.append('hasta', filtros.hasta);
  if (filtros.producto) params.append('producto', filtros.producto);
  const query = params.toString() ? `?${params.toString()}` : '';
  return await request(`/proveedores/${id}/historial${query}`, "GET");
};
