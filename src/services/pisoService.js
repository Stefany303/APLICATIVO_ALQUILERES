import api from './api';

const pisoService = {
    obtenerPorInmueble: async (inmuebleId) => {
        try {
          const response = await api.get(`/pisos/inmuebles/${inmuebleId}/pisos`);
          return response.data;
        } catch (error) {
          console.error(`Error al obtener los pisos del inmueble con ID ${inmuebleId}:`, error);
          throw error;
        }
      },
    
      // Obtener un piso por su ID
      obtenerPorId: async (id) => {
        try {
          const response = await api.get(`/pisos/${id}`);
          return response.data;
        } catch (error) {
          console.error(`Error al obtener el piso con ID ${id}:`, error);
          throw error;
        }
      },
    
      // Crear un nuevo piso
      crear: async (piso) => {
        try {
          const response = await api.post('/pisos', piso);
          return response.data;
        } catch (error) {
          console.error('Error al crear un piso:', error);
          throw error;
        }
      },
    
      // Actualizar un piso
      actualizar: async (id, nuevosDatos) => {
        try {
          const response = await api.put(`/pisos/${id}`, nuevosDatos);
          return response.data;
        } catch (error) {
          console.error(`Error al actualizar el piso con ID ${id}:`, error);
          throw error;
        }
      },
    
      // Eliminar un piso
      eliminar: async (id) => {
        try {
          const response = await api.delete(`/pisos/${id}`);
          return response.data;
        } catch (error) {
          console.error(`Error al eliminar el piso con ID ${id}:`, error);
          throw error;
        }
      },
};

export default pisoService;