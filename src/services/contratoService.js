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

  //aqui modifique borre informacion y puse detalles para que funcione
  obtenerContratosDetalles: async () => {
    try {
      const response = await api.get('/contratos/detalles');
      console.log('Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles de contratos:', error);
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
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

  crearContrato: async (contratoData) => {
    try {
      const response = await api.post('/contratos', contratoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear contrato:', error);
      throw error;
    }
  },

  actualizarContrato: async (id, contratoData) => {
    try {
      const response = await api.put(`/contratos/${id}`, contratoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar contrato:', error);
      throw error;
    }
  },

  eliminarContrato: async (id) => {
    try {
      const response = await api.delete(`/contratos/${id}`);
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
  }
};

export default contratoService; 