import { request } from "../api/api";

export const createSalida = async (data) => {
  return await request("/salidas", "POST", data);
};
