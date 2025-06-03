import api from './api';
import { API_URL } from './authService';

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

  // Obtener una persona por documento (DNI, RUC, etc.)
  obtenerPersonaPorDocumento: async (documento) => {
    try {
      const response = await api.get(`/personas/dni/${documento}`);
      return response.data;
    } catch (error) {
      // Si es 404, significa que no existe la persona
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Error al buscar persona por documento:', error);
      throw error;
    }
  },

  // Crear una nueva persona (protegido, solo administradores)
  crearPersona: async (personaData) => {
    try {
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
      console.error('Error al actualizar la persona:', error);
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