import axios from 'axios';

// Verificar si estamos en desarrollo o producción
const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment 
  ? 'http://localhost:3000/api'  // URL para desarrollo
  : process.env.REACT_APP_API_URL || 'http://localhost:3000/api';  // URL para producción

// Configurar axios para manejar errores de conexión
axios.defaults.timeout = 5000; // 5 segundos de timeout
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 500; // Aceptar cualquier status que no sea error del servidor
};

// Función para obtener el token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configurar interceptor para agregar el token a todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const inmuebleService = {
  // Obtener todos los inmuebles
  obtenerInmuebles: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No hay token de autenticación');
        return [];
      }

      const response = await axios.get(`${API_URL}/inmuebles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Respuesta de inmuebles:', response.data); // Debug

      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener inmuebles:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
      }
      return [];
    }
  },

  // Obtener un inmueble por ID
  obtenerInmueblePorId: async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No hay token de autenticación');
        return null;
      }

      const response = await axios.get(`${API_URL}/inmuebles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data || null;
    } catch (error) {
      console.error('Error al obtener el inmueble:', error);
      return null;
    }
  },

  // Obtener pisos por inmueble
  obtenerEspaciosPorInmueble: async (inmuebleId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No hay token de autenticación');
        return [];
      }

      console.log('Obteniendo pisos para inmueble:', inmuebleId); // Debug
      const response = await axios.get(`${API_URL}/pisos/inmuebles/${inmuebleId}/pisos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Respuesta de pisos:', response.data); // Debug

      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener pisos del inmueble:', error);
      return [];
    }
  },

  // Crear un nuevo inmueble
  crearInmueble: async (inmuebleData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No hay token de autenticación');
        return null;
      }

      const response = await axios.post(`${API_URL}/inmuebles`, inmuebleData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data || null;
    } catch (error) {
      console.error('Error al crear inmueble:', error);
      return null;
    }
  },

  // Actualizar un inmueble existente
  actualizarInmueble: async (id, inmuebleData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No hay token de autenticación');
        return null;
      }

      const response = await axios.put(`${API_URL}/inmuebles/${id}`, inmuebleData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data || null;
    } catch (error) {
      console.error('Error al actualizar inmueble:', error);
      return null;
    }
  },

  // Eliminar un inmueble
  eliminarInmueble: async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No hay token de autenticación');
        return null;
      }

      const response = await axios.delete(`${API_URL}/inmuebles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data || null;
    } catch (error) {
      console.error('Error al eliminar inmueble:', error);
      return null;
    }
  },

  obtenerPisosPorInmueble: async (inmuebleId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No hay token de autenticación');
        return [];
      }

      console.log('Obteniendo pisos para inmueble:', inmuebleId);
      const response = await axios.get(`${API_URL}/pisos/inmuebles/${inmuebleId}/pisos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Respuesta de pisos:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pisos:', error);
      throw error;
    }
  }
};

export default inmuebleService;