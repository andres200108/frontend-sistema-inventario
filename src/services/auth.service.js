import { request } from "../api/api";

/**
 * 🔐 LOGIN
 */
export const login = async (email, password) => {
  const res = await request("/auth/login", "POST", { email, password });

  console.log("LOGIN RESPONSE COMPLETO:", res);

  // 🔹 Guardar token
  localStorage.setItem("token", res.token);

  // 🔹 👈 IMPORTANTE: usar "usuario"
  localStorage.setItem("user", JSON.stringify(res.usuario));

  return res.usuario;
};

/**
 * 🚪 LOGOUT
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

