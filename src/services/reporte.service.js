import { request } from "../api/api";
export const getMovimientos = () => request("/reportes/movimientos", "GET");
export const exportarExcel  = () => {
  const token = localStorage.getItem("token");
  window.open(`/api/reportes/exportar/excel?token=${token}`, "_blank");
};
export const exportarPDF = () => {
  const token = localStorage.getItem("token");
  window.open(`/api/reportes/exportar/pdf?token=${token}`, "_blank");
};
