import api from './api';
import { API_URL } from './environment';

const inmuebleService = {
  // Obtener todos los inmuebles
  obtenerInmuebles: async () => {
    try {
      const response = await api.get('/inmuebles');

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
      const response = await api.get(`/inmuebles/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error al obtener el inmueble:', error);
      return null;
    }
  },

  // Obtener pisos por inmueble
  obtenerEspaciosPorInmueble: async (inmuebleId) => {
    try {
      const response = await api.get(`/pisos/inmuebles/${inmuebleId}/pisos`);

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
      const response = await api.post('/inmuebles', inmuebleData);
      return response.data || null;
    } catch (error) {
      console.error('Error al crear inmueble:', error);
      return null;
    }
  },

  // Actualizar un inmueble existente
  actualizarInmueble: async (id, inmuebleData) => {
    try {
      const response = await api.put(`/inmuebles/${id}`, inmuebleData);
      return response.data || null;
    } catch (error) {
      console.error('Error al actualizar inmueble:', error);
      return null;
    }
  },

  // Eliminar un inmueble
  eliminarInmueble: async (id) => {
    try {
      const response = await api.delete(`/inmuebles/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error al eliminar inmueble:', error);
      return null;
    }
  },

  obtenerPisosPorInmueble: async (inmuebleId) => {
    try {
      const response = await api.get(`/pisos/inmuebles/${inmuebleId}/pisos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pisos:', error);
      throw error;
    }
  }
};

export default inmuebleService;