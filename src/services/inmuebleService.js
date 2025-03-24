import api from '../services/api'; // Importa la instancia de axios

const inmuebleService = {
  // Obtener todos los inmuebles (público)
  obtenerInmuebles: async () => {
    try {
      const response = await api.get('/inmuebles');
      return response.data;
    } catch (error) {
      console.error('Error fetching inmuebles:', error);
      throw error;
    }
  },

  // Obtener un inmueble por ID (público)
  obtenerInmueblePorId: async (id) => {
    try {
      const response = await api.get(`/inmuebles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inmueble by ID:', error);
      throw error;
    }
  },

  // Crear un nuevo inmueble (protegido, solo administradores o propietarios)
  crearInmueble: async (inmuebleData) => {
    try {
      const response = await api.post('/inmuebles', inmuebleData);
      return response.data;
    } catch (error) {
      console.error('Error creating inmueble:', error);
      throw error;
    }
  },

  // Actualizar un inmueble existente (protegido, solo administradores o propietarios)
  actualizarInmueble: async (id, inmuebleData) => {
    try {
      const response = await api.put(`/inmuebles/${id}`, inmuebleData);
      return response.data;
    } catch (error) {
      console.error('Error updating inmueble:', error);
      throw error;
    }
  },

  // Eliminar un inmueble (protegido, solo administradores o propietarios)
  eliminarInmueble: async (id) => {
    try {
      const response = await api.delete(`/inmuebles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inmueble:', error);
      throw error;
    }
  },
};

export default inmuebleService;