// Usa /api relativo — Vite lo redirige al backend automáticamente
const API_URL = "/api";

export const request = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  if (token) {
  console.log("TOKEN:", token);
  options.headers["Authorization"] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  } catch (error) {
    console.error("❌ Error en request:", error);
    throw error;
  }
};
