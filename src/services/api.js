import axios from "axios";
import { API_URL, environment } from '../environment';

const api = axios.create({
  baseURL: API_URL,
  timeout: environment.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: false // Deshabilitamos withCredentials ya que no lo necesitamos para este caso
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

// Interceptor para agregar el token de autenticación a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Si estamos enviando un FormData, no establecer Content-Type
    // Axios lo configurará automáticamente con el boundary correcto
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
    if (environment.DEBUG) {
      console.log(`${response.config.method.toUpperCase()} ${response.config.url} - Estado: ${response.status}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (environment.DEBUG) {
      console.error('Error en petición API:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    // Si es un error 401 y no es una petición de refresh token
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url.includes('/auth/refresh')) {
      
      if (isRefreshing) {
        // Si ya estamos refrescando, agregar a la cola
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
          throw new Error('No hay refresh token disponible');
        }

        const response = await api.post('/auth/refresh', { refreshToken });
        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('token', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Actualizar el token en la petición original y en la cola
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        processQueue(null, token);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        if (!isRedirecting) {
          isRedirecting = true;
          console.warn('No se pudo refrescar el token. Redirigiendo al login...');
          
          // Limpiar datos de sesión
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirigir y recargar para limpiar el estado de la aplicación
          window.location.href = '/login';
          
          setTimeout(() => {
            isRedirecting = false;
          }, 2000);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;