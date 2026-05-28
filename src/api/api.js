// ─────────────────────────────────────────────────────────────────────────────
// API CLIENT — SGI
// Maneja todas las peticiones HTTP al backend, autenticación JWT,
// cierre de sesión por inactividad y descarga de archivos.
// ─────────────────────────────────────────────────────────────────────────────

// En desarrollo usa el proxy de Vite (/api → localhost:4001)
// En producción usa la variable de entorno VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

// ── Cierre de sesión por inactividad ─────────────────────────────────────────
const INACTIVITY_TIMEOUT = 29 * 60 * 1000; // 29 minutos
let inactivityTimer = null;

const logoutByInactivity = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};

export const resetInactivityTimer = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(logoutByInactivity, INACTIVITY_TIMEOUT);
};

// Escuchar eventos de actividad del usuario
if (typeof window !== "undefined") {
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(event =>
    window.addEventListener(event, resetInactivityTimer)
  );
  resetInactivityTimer();
}

// ── Petición HTTP principal ───────────────────────────────────────────────────
export const request = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("token");
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (token) options.headers["Authorization"] = `Bearer ${token}`;
  if (data)  options.body = JSON.stringify(data);

  const res  = await fetch(`${API_URL}${endpoint}`, options);
  const json = await res.json();

  if (!res.ok) {
    // Token expirado o inválido → cerrar sesión automáticamente
    if (res.status === 401 || (res.status === 403 && json.message?.includes("Token"))) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    console.error("❌ Error del servidor:", json);
    throw json;
  }

  resetInactivityTimer();
  return json;
};

// ── Descarga de archivos (PDF / Excel) ───────────────────────────────────────
export const descargar = async (endpoint, filename) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method:  "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error descargando archivo");
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    resetInactivityTimer();
  } catch(e) {
    alert("Error descargando el archivo: " + e.message);
  }
};
