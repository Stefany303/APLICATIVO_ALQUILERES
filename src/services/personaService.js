import api from './api';

const personaService = {
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
      return response.data;
    } catch (error) {
      console.error('Error fetching personas:', error);
      throw error;
    }
  },

  obtenerPersonaPorId: async (id) => {
    try {
      const response = await api.get(`/personas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching persona by ID:', error);
      throw error;
    }
  },

  obtenerPersonaPorEmail: async (email) => {
    try {
      const response = await api.get(`/personas/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching persona by email:', error);
      throw error;
    }
  },

  obtenerPersonaPorDocumento: async (documento) => {
    try {
      const response = await api.get(`/personas/dni/${documento}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error al buscar persona por documento:', error);
      throw error;
    }
  },

  crearPersona: async (personaData) => {
    try {
      const response = await api.post('/personas', personaData);
      return response.data;
    } catch (error) {
      console.error('Error creando persona:', error);
      throw error;
    }
  },

  crearPersonaYUsuario: async (personaData) => {
    try {
      const response = await api.post('/auth/registrar', personaData);
      return response.data;
    } catch (error) {
      console.error('Error creando el usuario:', error);
      throw error;
    }
  },

  //cambio de contraseña
  cambiarContrasena: async (contrasenaActual, nuevaContrasena) => {
    try {
      const response = await api.post('/auth/cambiar-contrasena', {
        contraseñaActual: contrasenaActual,
        nuevaContraseña: nuevaContrasena
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      throw error;
    }
  },

  actualizarPersona: async (id, personaData) => {
    try {
      const response = await api.put(`/personas/${id}`, personaData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la persona:', error);
      throw error;
    }
  },

  eliminarPersona: async (id) => {
    try {
      const response = await api.delete(`/personas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting persona:', error);
      throw error;
    }
  },

  registrarPersonaYUsuario: async (personaData) => {
    return await personaService.crearPersonaYUsuario(personaData);
  }
};

export default personaService;
