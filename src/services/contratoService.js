import api from './api';
import { API_URL, getAuthToken } from './authService';

const contratoService = {
  obtenerContratos: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Token usado:', token);
      const response = await api.get(`${API_URL}/contratos/info`);
      console.log('Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error detallado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  obtenerContratoPorId: async (id) => {
    try {
      const response = await api.get(`${API_URL}/contratos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el contrato:', error);
      throw error;
    }
  },

  crearContrato: async (contratoData) => {
    try {
      const response = await api.post(`${API_URL}/contratos`, contratoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear el contrato:', error);
      throw error;
    }
  },

  actualizarContrato: async (id, contratoData) => {
    try {
      const response = await api.put(`${API_URL}/contratos/${id}`, contratoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el contrato:', error);
      throw error;
    }
  },

  eliminarContrato: async (id) => {
    try {
      await api.delete(`${API_URL}/contratos/${id}`);
    } catch (error) {
      console.error('Error al eliminar el contrato:', error);
      throw error;
    }
  },

  obtenerEspaciosDisponibles: async () => {
    try {
      const response = await api.get(`${API_URL}/espacios/disponibles`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener espacios disponibles:', error);
      throw error;
    }
  }
};

export default contratoService; 