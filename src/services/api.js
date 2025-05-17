import axios from "axios";
import { API_URL, environment } from '../environment';

const api = axios.create({
  baseURL: API_URL,
  timeout: environment.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Interceptor para agregar el token de autenticación a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Si estamos enviando un FormData, no establecer Content-Type
    // Axios lo configurará automáticamente con el boundary correcto
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Añadir token de autenticación a cada petición
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (environment.DEBUG) {
        console.log('Token añadido a petición:', token.substring(0, 15) + '...');
      }
    } else {
      console.warn('No se encontró token de autenticación en localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de autenticación
api.interceptors.response.use(
  (response) => {
    if (environment.DEBUG) {
      console.log(`${response.config.method.toUpperCase()} ${response.config.url} - Estado: ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Log detallado de errores
    if (environment.DEBUG) {
      console.error('Error en petición API:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    // Si recibimos un 401 Unauthorized, el token puede haber expirado
    if (error.response && error.response.status === 401) {
      console.warn('Token expirado o inválido. Redirigiendo al login...');
      localStorage.removeItem('token'); // Limpiar token
      window.location.href = '/login'; // Redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;