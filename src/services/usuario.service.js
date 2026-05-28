import { request } from "../api/api";
export const getUsuarios     = () => request("/usuarios", "GET");
export const createUsuario   = (data) => request("/usuarios", "POST", data);
export const updateUsuario   = (id, data) => request(`/usuarios/${id}`, "PUT", data);
export const toggleUsuario   = (id, activo) => request(`/usuarios/${id}/toggle`, "PATCH", { activo });
export const resetPassword   = (id, password) => request(`/usuarios/${id}/password`, "PATCH", { password });
