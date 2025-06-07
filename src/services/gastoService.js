import api from './api';

const gastoService = {
  obtenerGastos: async () => {
    try {
      const response = await api.get('/gastos');
      return response.data;
    } catch (error) {
      // console.error('Error al obtener gastos:', error);
      throw error;
    }
  },

  obtenerGastoPorId: async (id) => {
    try {
      const response = await api.get(`/gastos/${id}`);
      return response.data;
    } catch (error) {
      // console.error('Error al obtener el gasto:', error);
      throw error;
    }
  },

  obtenerGastosPorInmueble: async (inmuebleId) => {
    try {
      const response = await api.get(`/gastos/inmueble/${inmuebleId}`);
      return response.data;
    } catch (error) {
      // console.error('Error al obtener gastos por inmueble:', error);
      throw error;
    }
  },

  buscarGastos: async (termino) => {
    try {
      const response = await api.get('/gastos/buscar', {
        params: { termino }
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

      const response = await api.post('/gastos', datosMapeados);
      
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

      const response = await api.put(`/gastos/${id}`, datosMapeados);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el gasto:', error);
      throw error;
    }
  },

  eliminarGasto: async (id) => {
    try {
      await api.delete(`/gastos/${id}`);
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
      throw error;
    }
  }
};

export default gastoService; 