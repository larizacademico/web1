import axios from "axios";

// Verifique se a porta é 9090 ou 8080 (onde seu Java está rodando)
const api = axios.create({
  baseURL: "http://localhost:9090", 
});

// INTERCEPTOR (O segredo! 🤫)
// Antes de cada requisição, ele vai no navegador, pega o token e anexa.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    // Adiciona o cabeçalho "Authorization: Bearer xxxxx..."
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;