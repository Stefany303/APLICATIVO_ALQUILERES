import api from '../services/api';

const espacioService = {
  // Obtener todos los espacios de un piso
  obtenerEspaciosPorPiso: async (inmuebleId, pisoId) => {
    try {
      const response = await api.get(`/inmuebles/${inmuebleId}/pisos/${pisoId}/espacios`);
      return response.data;
    } catch (error) {
      console.error('Error fetching espacios por piso:', error);
      throw error;
    }
  },

  // Obtener un espacio específico
  obtenerEspacioPorId: async (inmuebleId, pisoId, espacioId) => {
    try {
      const response = await api.get(`/inmuebles/${inmuebleId}/pisos/${pisoId}/espacios/${espacioId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching espacio por ID:', error);
      throw error;
    }
  },

  // Crear un nuevo espacio en un piso
  crearEspacio: async (inmuebleId, pisoId, espacioData) => {
    try {
      const response = await api.post(
        `/inmuebles/${inmuebleId}/pisos/${pisoId}/espacios`,
        espacioData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating espacio:', error);
      throw error;
    }
  },

  // Actualizar un espacio existente
  actualizarEspacio: async (inmuebleId, pisoId, espacioId, espacioData) => {
    try {
      const response = await api.put(
        `/inmuebles/${inmuebleId}/pisos/${pisoId}/espacios/${espacioId}`,
        espacioData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating espacio:', error);
      throw error;
    }
  },

  // Eliminar un espacio
  eliminarEspacio: async (inmuebleId, pisoId, espacioId) => {
    try {
      const response = await api.delete(
        `/inmuebles/${inmuebleId}/pisos/${pisoId}/espacios/${espacioId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting espacio:', error);
      throw error;
    }
  },
};

export default espacioService;