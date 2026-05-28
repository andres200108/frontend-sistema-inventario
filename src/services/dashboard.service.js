import { request } from "../api/api";
export const getResumen = () => request("/dashboard", "GET");
