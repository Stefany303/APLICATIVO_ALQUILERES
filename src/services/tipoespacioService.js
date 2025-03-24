import api from './api'; // Importa la instancia de axios

const tipoEspacioService = {
    obtenerTodos: async () => {
        try {
          const response = await api.get('/tipos-espacio');
          return response.data;
        } catch (error) {
          console.error('Error al obtener tipos de espacios:', error);
          throw error;
        }
      },
    
      // Obtener un tipo de espacio por ID
      obtenerPorId: async (id) => {
        try {
          const response = await api.get(`/tipos-espacio/${id}`);
          return response.data;
        } catch (error) {
          console.error(`Error al obtener el tipo de espacio con ID ${id}:`, error);
          throw error;
        }
      },
    
      // Crear un nuevo tipo de espacio
      crear: async (nombre) => {
        try {
          const response = await api.post('/tipos-espacio', { nombre });
          return response.data;
        } catch (error) {
          console.error('Error al crear un tipo de espacio:', error);
          throw error;
        }
      },
    
      // Actualizar un tipo de espacio
      actualizar: async (id, nombre) => {
        try {
          const response = await api.put(`/tipos-espacio/${id}`, { nombre });
          return response.data;
        } catch (error) {
          console.error(`Error al actualizar el tipo de espacio con ID ${id}:`, error);
          throw error;
        }
      },
    
      // Eliminar un tipo de espacio
      eliminar: async (id) => {
        try {
          const response = await api.delete(`/tipos-espacio/${id}`);
          return response.data;
        } catch (error) {
          console.error(`Error al eliminar el tipo de espacio con ID ${id}:`, error);
          throw error;
        }
      },
};

export default tipoEspacioService;