import axios from "axios";
import { API_URL, environment } from './environment';
import { message } from 'antd';

const api = axios.create({
  baseURL: API_URL,
  timeout: environment.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: false
});

// Variable para controlar si ya estamos redirigiendo
let isRedirecting = false;
// Variable para controlar si estamos refrescando el token
let isRefreshing = false;
// Cola de peticiones fallidas que esperan el nuevo token
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Función para limpiar la sesión
const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('lastActivity');
};

// Función para manejar la expiración del token
const handleTokenExpiration = () => {
  if (isRedirecting) return; // Evitar múltiples redirecciones
  
  isRedirecting = true;
  clearSession();
  
  // Mostrar mensaje al usuario
  message.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  
  // Redirigir al login
  window.location.href = '/login';
};

// Interceptor para agregar el token de autenticación a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Si estamos enviando un FormData, no establecer Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Añadir token de autenticación a cada petición
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos un 401 Unauthorized y no es una petición de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/renovar-token')) {
      console.log('[API] 401 detectado. Intentando refresh de token...');
      if (isRefreshing) {
        // Si ya estamos refrescando, encolar la petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('[API] No refresh token disponible.');
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/renovar-token', { refreshToken });
        const { token } = response.data;
        console.log('[API] Token refrescado correctamente.');

        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        processQueue(null, token);
        return api(originalRequest);
      } catch (refreshError) {
        console.log('[API] Error al refrescar token. Limpiando sesión...');
        processQueue(refreshError, null);
        handleTokenExpiration();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      console.log('[API] 401 detectado. Token inválido. Limpiando sesión...');
    }

    return Promise.reject(error);
  }
);

export default api;