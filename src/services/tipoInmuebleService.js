import api from './api'; // Importa la instancia de axios

const tipoInmuebleService = {
  // Obtener todos los tipoInmueble (público)
  obtenertipoInmueble: async () => {
    try {
      const response = await api.get('/tipoInmueble');
      return response.data;
    } catch (error) {
      console.error('Error fetching tipoInmueble:', error);
      throw error;
    }
  },

  // Obtener un inmueble por ID (público)
  obtenertipoInmueblePorId: async (id) => {
    try {
      const response = await api.get(`/tipoInmueble/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tipo de inmueble by ID:', error);
      throw error;
    }
  },

  // Crear un nuevo inmueble (protegido, solo administradores o propietarios)
  creartipoInmueble: async (tipoInmuebleData) => {
    try {
      const response = await api.post('/tipoInmueble', tipoInmuebleData);
      return response.data;
    } catch (error) {
      console.error('Error creating tipo de inmueble:', error);
      throw error;
    }
  },

  // Actualizar un inmueble existente (protegido, solo administradores o propietarios)
  actualizartipoInmueble: async (id, tipoInmuebleData) => {
    try {
      const response = await api.put(`/tipoInmueble/${id}`, tipoInmuebleData);
      return response.data;
    } catch (error) {
      console.error('Error updating tipo de tipoInmueble:', error);
      throw error;
    }
  },

  // Eliminar un inmueble (protegido, solo administradores o propietarios)
  eliminartipoInmueble: async (id) => {
    try {
      const response = await api.delete(`/tipoInmueble/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting tipo de inmueble:', error);
      throw error;
    }
  },
};

export default tipoInmuebleService;