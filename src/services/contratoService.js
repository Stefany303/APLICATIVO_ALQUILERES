import api from './api';
import { API_URL, getAuthToken } from './authService';

const contratoService = {
  obtenerContratos: async () => {
    try {
      const response = await api.get('/contratos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      throw error;
    }
  },

  // Obtener todos los contratos con detalles
  obtenerContratosDetalles: async () => {
    try {
      const response = await api.get(`${API_URL}/contratos/detalles`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener contratos con detalles:', error);
      throw error;
    }
  },

  // Obtener contratos con información detallada por inquilino (dni o nombre)
  obtenerContratosPorInquilino: async (dni = null, nombre = null) => {
    try {
      const params = {};
      if (dni) params.dni = dni;
      if (nombre) params.nombre = nombre;

      const response = await api.get(`${API_URL}/contratos/inquilinos/detalles`, { params });
      return response.data; // Devuelve los datos obtenidos
    } catch (error) {
      console.error('Error al obtener los contratos:', error);
      throw error; // Lanza el error para manejarlo en el componente
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

  // Crear un nuevo contrato
  crearContrato: async (contratoData) => {
    try {
      const response = await api.post(`${API_URL}/contratos`, contratoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear contrato:', error);
      throw error;
    }
  },

  // Actualizar un contrato
  actualizarContrato: async (id, contratoData) => {
    try {
      const response = await api.put(`${API_URL}/contratos/${id}`, contratoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar contrato:', error);
      throw error;
    }
  },

  // Eliminar un contrato
  eliminarContrato: async (id) => {
    try {
      const response = await api.delete(`${API_URL}/contratos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar contrato:', error);
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
  },

  // Función para activar un contrato
  activarContrato: async (id) => {
    try {
      // Enviamos el estado 'activo' en el cuerpo de la petición
      const response = await api.put(`/contratos/${id}`, {
        estado: 'activo'
      });
      return response.data;
    } catch (error) {
      console.error('Error al activar el contrato:', error);
      throw error;
    }
  }
};

export default contratoService; 