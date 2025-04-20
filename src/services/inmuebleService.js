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

const inmuebleService = {
  // Obtener todos los inmuebles
  obtenerInmuebles: async () => {
    try {
      const response = await axios.get(`${API_URL}/inmuebles`);
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener inmuebles:', error);
      return [];
    }
  },

  // Obtener un inmueble por ID
  obtenerInmueblePorId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/inmuebles/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error al obtener el inmueble:', error);
      return null;
    }
  },

  // Obtener pisos por inmueble
  obtenerEspaciosPorInmueble: async (inmuebleId) => {
    try {
      console.log('Obteniendo pisos para inmueble:', inmuebleId); // Debug
      const response = await axios.get(`${API_URL}/pisos/inmuebles/${inmuebleId}/pisos`);
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
      const response = await axios.post(`${API_URL}/inmuebles`, inmuebleData);
      return response.data || null;
    } catch (error) {
      console.error('Error al crear inmueble:', error);
      return null;
    }
  },

  // Actualizar un inmueble existente
  actualizarInmueble: async (id, inmuebleData) => {
    try {
      const response = await axios.put(`${API_URL}/inmuebles/${id}`, inmuebleData);
      return response.data || null;
    } catch (error) {
      console.error('Error al actualizar inmueble:', error);
      return null;
    }
  },

  // Eliminar un inmueble
  eliminarInmueble: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/inmuebles/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error al eliminar inmueble:', error);
      return null;
    }
  },

  obtenerPisosPorInmueble: async (inmuebleId) => {
    try {
      console.log('Obteniendo pisos para inmueble:', inmuebleId);
      const response = await axios.get(`${API_URL}/pisos/inmuebles/${inmuebleId}/pisos`);
      console.log('Respuesta de pisos:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pisos:', error);
      throw error;
    }
  }
};

export default inmuebleService;