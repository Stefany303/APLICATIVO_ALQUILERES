import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const gastoService = {
  obtenerGastos: async () => {
    try {
      const response = await axios.get(`${API_URL}/gastos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener gastos:', error);
      throw error;
    }
  },

  obtenerGastoPorId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/gastos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el gasto:', error);
      throw error;
    }
  },

  crearGasto: async (gastoData) => {
    try {
      const response = await axios.post(`${API_URL}/gastos`, gastoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear el gasto:', error);
      throw error;
    }
  },

  actualizarGasto: async (id, gastoData) => {
    try {
      const response = await axios.put(`${API_URL}/gastos/${id}`, gastoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el gasto:', error);
      throw error;
    }
  },

  eliminarGasto: async (id) => {
    try {
      await axios.delete(`${API_URL}/gastos/${id}`);
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
      throw error;
    }
  }
};

export default gastoService; 