import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9090", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    // Adiciona o cabeçalho "Authorization: Bearer xxxxx..."
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;