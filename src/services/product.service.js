import { request } from "../api/api";

export const getProductByCodigo = async (codigo) => {
  return await request(`/productos/codigo/${codigo}`, "GET");
};

export const getProducts = async () => {
  return await request("/productos", "GET");
};

export const searchProducts = async (query) => {
  return await request(`/productos/search?q=${encodeURIComponent(query)}`, "GET");
};

export const getProductById = async (id) => {
  return await request(`/productos/${id}`, "GET");
};

export const createProduct = async (product) => {
  return await request("/productos", "POST", product);
};

export const updateProduct = async (id, product) => {
  return await request(`/productos/${id}`, "PUT", product);
};

export const deleteProduct = async (id) => {
  return await request(`/productos/${id}`, "DELETE");
};
