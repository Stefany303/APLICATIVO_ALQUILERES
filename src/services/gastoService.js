import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Configuración de axios para incluir el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const gastoService = {
  obtenerGastos: async () => {
    try {
      const response = await axios.get(`${API_URL}/gastos`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      // console.error('Error al obtener gastos:', error);
      throw error;
    }
  },

  obtenerGastoPorId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/gastos/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      // console.error('Error al obtener el gasto:', error);
      throw error;
    }
  },

  obtenerGastosPorInmueble: async (inmuebleId) => {
    try {
      const response = await axios.get(`${API_URL}/gastos/inmueble/${inmuebleId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      // console.error('Error al obtener gastos por inmueble:', error);
      throw error;
    }
  },

  buscarGastos: async (termino) => {
    try {
      const response = await axios.get(`${API_URL}/gastos/buscar`, {
        params: { termino },
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      // console.error('Error al buscar gastos:', error);
      throw error;
    }
  },

  crearGasto: async (gastoData) => {
    try {
      // Mapear los campos al formato que espera el backend
      const datosMapeados = {
        inmueble_id: gastoData.inmueble_id,
        tipo_gasto: gastoData.categoria,      // Mapeo de categoria a tipo_gasto
        descripcion: gastoData.concepto,      // Mapeo de concepto a descripcion
        monto: gastoData.monto,
        fecha: gastoData.fecha_gasto,         // Mapeo de fecha_gasto a fecha
        estado: gastoData.estado,             // Campos adicionales
        observaciones: gastoData.observaciones
      };

      const response = await axios.post(`${API_URL}/gastos`, datosMapeados, {
        headers: getAuthHeader()
      });
      
      // Verificar que la respuesta tenga el formato esperado
      if (response.data && response.data.mensaje === 'Gasto creado' && response.data.id) {
        return { id: response.data.id };
      }
      
      return response.data;
    } catch (error) {
      // console.error('Error al crear el gasto:', error);
      throw error;
    }
  },

  actualizarGasto: async (id, gastoData) => {
    try {
      // Mapear los campos al formato que espera el backend
      const datosMapeados = {
        inmueble_id: gastoData.inmueble_id,
        tipo_gasto: gastoData.categoria,      // Mapeo de categoria a tipo_gasto
        descripcion: gastoData.concepto,      // Mapeo de concepto a descripcion
        monto: gastoData.monto,
        fecha: gastoData.fecha_gasto,         // Mapeo de fecha_gasto a fecha
        estado: gastoData.estado,             // Campos adicionales
        observaciones: gastoData.observaciones
      };

      const response = await axios.put(`${API_URL}/gastos/${id}`, datosMapeados, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el gasto:', error);
      throw error;
    }
  },

  eliminarGasto: async (id) => {
    try {
      await axios.delete(`${API_URL}/gastos/${id}`, {
        headers: getAuthHeader()
      });
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
      throw error;
    }
  }
};

export default gastoService; 