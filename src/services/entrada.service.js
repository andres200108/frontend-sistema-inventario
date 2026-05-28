import { request } from "../api/api";

export const createEntrada = async (data) => {
  return await request("/entradas", "POST", data);
};

export const registrarEntrada = async (data) => {
  return await request("/entradas", "POST", data);
};

export const getEntradas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    if (filtros.search) params.append('search', filtros.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await request(`/entradas${query}`);
  } catch (error) {
    console.error('Error al obtener entradas:', error);
    throw error;
  }
};

export const getEntrada = async (id) => {
  return await request(`/entradas/${id}`);
};

export const updateEntrada = async (id, data) => {
  return await request(`/entradas/${id}`, "PUT", data);
};

export const deleteEntrada = async (id) => {
  return await request(`/entradas/${id}`, "DELETE");
};

// Función específica para recibir desde OC
export const recibirDesdeOC = async (ordenId, recepciones, observacion = "") => {
  return await request(`/ordenes/${ordenId}/recibir`, "POST", { 
    recepciones,
    observacion 
  });
};
