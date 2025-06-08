import api from './api';
import moment from 'moment';

const pagoService = {
  obtenerPagos: async () => {
    try {
      const response = await api.get('/pagos/buscar');
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      throw error;
    }
  },

  obtenerPagoPorId: async (id) => {
    try {
      const response = await api.get(`/pagos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el pago:', error);
      throw error;
    }
  },
  // Obtener todos los pagos  por inquilino (dni o nombre)
  obtenerPagosPorInquilino: async (dni = null, nombre = null) => {
    try {
      const params = {};
      if (dni) params.dni = dni;
      if (nombre) params.nombre = nombre;

      const response = await api.get('/pagos/buscador', { params });
      return response.data; // Devuelve los datos obtenidos
    } catch (error) {
      console.error('Error al obtener los contratos:', error);
      throw error; // Lanza el error para manejarlo en el componente
    }
  },
  crearPago: async (pagoData) => {
    try {
      const response = await api.post('/pagos', pagoData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
          throw new Error(`Error del servidor: ${error.response.data.message}`);
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      }
      throw error;
    }
  },

  actualizarPago: async (id, pagoData) => {
    try {
      // Obtener el pago actual para asegurarnos de tener todos los campos necesarios
      const pagoActual = await pagoService.obtenerPagoPorId(id);
      
      // Combinar los datos actuales con los nuevos datos
      const datosActualizados = {
        ...pagoActual,
        ...pagoData
      };

      // Formatear todas las fechas al formato YYYY-MM-DD
      const camposFecha = ['fecha_pago', 'fecha_real_pago', 'creado_en', 'actualizado_en'];
      camposFecha.forEach(campo => {
        if (datosActualizados[campo]) {
          datosActualizados[campo] = moment(datosActualizados[campo]).format('YYYY-MM-DD');
        }
      });
      
      // Validar campos requeridos
      const camposRequeridos = ['contrato_id', 'monto', 'tipo_pago', 'estado', 'fecha_pago'];
      const camposFaltantes = camposRequeridos.filter(campo => 
        !datosActualizados[campo] || datosActualizados[campo] === ''
      );

      if (camposFaltantes.length > 0) {
        throw new Error(`Los siguientes campos son requeridos: ${camposFaltantes.join(', ')}`);
      }
      
      const response = await api.put(`/pagos/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
          throw new Error(`Error del servidor: ${error.response.data.message}`);
      }
      throw error;
    }
  },

  eliminarPago: async (id) => {
    try {
      await api.delete(`/pagos/${id}`);
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
      throw error;
    }
  }
};

export default pagoService; 