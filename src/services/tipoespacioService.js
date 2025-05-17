import api from './api';
import { API_URL } from '../environment';


const ENDPOINT_BASE = API_URL + '/tipos-espacio';

const tipoEspacioService = {
    obtenerTodos: async () => {
        try {
          const response = await api.get(ENDPOINT_BASE);
          return response.data;
        } catch (error) {
          console.error('Error al obtener tipos de espacios:', error);
          throw error;
        }
      },
    
      // Obtener un tipo de espacio por ID
      obtenerPorId: async (id) => {
        try {
          const response = await api.get(`${ENDPOINT_BASE}/${id}`);
          return response.data;
        } catch (error) {
          console.error(`Error al obtener el tipo de espacio con ID ${id}:`, error);
          throw error;
        }
      },
    
      // Crear un nuevo tipo de espacio
      crear: async (nombre) => {
        try {
          const response = await api.post(ENDPOINT_BASE, { nombre });
          return response.data;
        } catch (error) {
          console.error('Error al crear un tipo de espacio:', error);
          throw error;
        }
      },
    
      // Actualizar un tipo de espacio
      actualizar: async (id, nombre) => {
        try {
          const response = await api.put(`${ENDPOINT_BASE}/${id}`, { nombre });
          return response.data;
        } catch (error) {
          console.error(`Error al actualizar el tipo de espacio con ID ${id}:`, error);
          throw error;
        }
      },
    
      // Eliminar un tipo de espacio
      eliminar: async (id) => {
        try {
          const response = await api.delete(`${ENDPOINT_BASE}/${id}`);
          return response.data;
        } catch (error) {
          console.error(`Error al eliminar el tipo de espacio con ID ${id}:`, error);
          throw error;
        }
      },
};

export default tipoEspacioService;