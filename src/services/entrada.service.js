import { request } from "../api/api";

export const createEntrada = async (data) => {
  return await request("/entradas", "POST", data);
};
