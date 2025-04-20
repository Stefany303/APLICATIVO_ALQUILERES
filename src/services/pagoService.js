import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const pagoService = {
  obtenerPagos: async () => {
    try {
      const response = await axios.get(`${API_URL}/pagos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      throw error;
    }
  },

  obtenerPagoPorId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/pagos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el pago:', error);
      throw error;
    }
  },

  crearPago: async (pagoData) => {
    try {
      const response = await axios.post(`${API_URL}/pagos`, pagoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear el pago:', error);
      throw error;
    }
  },

  actualizarPago: async (id, pagoData) => {
    try {
      const response = await axios.put(`${API_URL}/pagos/${id}`, pagoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
      throw error;
    }
  },

  eliminarPago: async (id) => {
    try {
      await axios.delete(`${API_URL}/pagos/${id}`);
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
      throw error;
    }
  }
};

export default pagoService; 