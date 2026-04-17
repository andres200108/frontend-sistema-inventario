import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api";

/**
 * 👤 Crear usuario (solo admin)
 */
export const createUser = async (user) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(`${API_URL}/auth/register`, user, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
