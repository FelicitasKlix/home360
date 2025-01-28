import axios from 'axios';

// Configura Axios con la URL de tu backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Cambia a la IP de tu backend
});

export default api;
