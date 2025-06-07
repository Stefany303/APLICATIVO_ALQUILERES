import api from './api';
import { API_URL } from './environment';

// Configurar axios para manejar errores de conexión
api.defaults.timeout = 10000; // 10 segundos de timeout
api.defaults.validateStatus = function (status) {
  return status >= 200 && status < 500; // Aceptar cualquier status que no sea error del servidor
};

// Función para obtener el token del localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }
  return `Bearer ${token}`;
};

// Función para guardar el token
const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Función para eliminar el token
const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Configurar interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Configurar interceptor para manejar respuestas
api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        removeAuthToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
);

export { API_URL, getAuthToken, setAuthToken, removeAuthToken }; 