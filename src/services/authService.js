import api from './api';

// Verificar si estamos en desarrollo o producción
const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment
    ? 'http://localhost:3000/api'  // URL para desarrollo (puerto 3000)
    : process.env.REACT_APP_API_URL || 'http://localhost:3000/api';  // URL para producción

// Configurar axios para manejar errores de conexión
api.defaults.timeout = 10000; // 10 segundos de timeout
api.defaults.validateStatus = function (status) {
  return status >= 200 && status < 500; // Aceptar cualquier status que no sea error del servidor
};

// Función para obtener el token del localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Token obtenido del localStorage:', token);
  if (!token) {
    console.warn('No se encontró token en el localStorage');
    return null;
  }
  return `Bearer ${token}`;
};

// Función para guardar el token
const setAuthToken = (token) => {
  console.log('Guardando token en localStorage:', token);
  localStorage.setItem('token', token);
};

// Función para eliminar el token
const removeAuthToken = () => {
  console.log('Eliminando token del localStorage');
  localStorage.removeItem('token');
};

// Configurar interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        console.log('Agregando token a la petición:', token);
        config.headers.Authorization = token;
      } else {
        console.warn('No se pudo agregar token a la petición');
      }
      return config;
    },
    (error) => {
      console.error('Error en el interceptor de peticiones:', error);
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
        console.warn('Token inválido o expirado');
        removeAuthToken();
        // Aquí podrías redirigir al usuario a la página de login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
);

export { API_URL, getAuthToken, setAuthToken, removeAuthToken }; 