import api from '../services/api'; // Importa la instancia de axios

const personaService = {
  // Obtener todas las personas (público)
  obtenerPersonas: async () => {
    try {
      const response = await api.get('/personas');
      return response.data;
    } catch (error) {
      console.error('Error fetching personas:', error);
      throw error;
    }
  },

  obtenerInquilinos: async () => {
    try {
      const response = await api.get('/personas/inquilinosObtener');
      console.log('Respuesta de personas:', response);
      return response.data;

    } catch (error) {
      console.error('Error fetching personas:', error);
      throw error;
    }
  },
  // Obtener una persona por ID (público)
  obtenerPersonaPorId: async (id) => {
    try {
      const response = await api.get(`/personas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching persona by ID:', error);
      throw error;
    }
  },

  // Obtener una persona por email (público)
  obtenerPersonaPorEmail: async (email) => {
    try {
      const response = await api.get(`/personas/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching persona by email:', error);
      throw error;
    }
  },

  // Crear una nueva persona (protegido, solo administradores)
  crearPersona: async (personaData) => {
    try {
      console.log('personaData:', personaData);
      const response = await api.post('/personas', personaData);
      return response.data;
    } catch (error) {
      console.error('Error creando persona:', error);
      throw error;
    }
  },
   // Crear una nueva persona y usuario (protegido, solo administradores)
   crearPersonaYUsuario: async (personaData) => {
    try {
      const response = await api.post('/auth/registrar', personaData);
      return response.data;
    } catch (error) {
      console.error('Error creando el usuario:', error);
      throw error;
    }
  },

  // Actualizar una persona existente (protegido, solo administradores)
  actualizarPersona: async (id, personaData) => {
    try {
      const response = await api.put(`/personas/${id}`, personaData);
      return response.data;
    } catch (error) {
      console.error('Error updating persona:', error);
      throw error;
    }
  },

  // Eliminar una persona (protegido, solo administradores)
  eliminarPersona: async (id) => {
    try {
      const response = await api.delete(`/personas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting persona:', error);
      throw error;
    }
  },
};

export default personaService;