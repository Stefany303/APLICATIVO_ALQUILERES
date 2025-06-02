import api from './api';
import { API_URL, getAuthToken } from './authService';

const pagoService = {
  obtenerPagos: async () => {
    try {
      const response = await api.get(`${API_URL}/pagos/buscar`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      throw error;
    }
  },

  obtenerPagoPorId: async (id) => {
    try {
      const response = await api.get(`${API_URL}/pagos/${id}`);
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

      const response = await api.get(`${API_URL}/pagos/buscador`, { params });
      return response.data; // Devuelve los datos obtenidos
    } catch (error) {
      console.error('Error al obtener los contratos:', error);
      throw error; // Lanza el error para manejarlo en el componente
    }
  },
  crearPago: async (pagoData) => {
    try {
      // Obtener el token de autenticación
      const token = getAuthToken();
      if (!token) {
        throw new Error('No autorizado: Inicie sesión para realizar esta acción');
      }
      
      // Configurar headers con el token
      const config = {
        headers: {
          'Authorization': token
        }
      };
      
      const response = await api.post(`${API_URL}/pagos`, pagoData, config);
      return response.data;
    } catch (error) {
      // Obtener más detalles sobre el error
      if (error.response) {
        // Si hay un mensaje de error específico en la respuesta, úsalo
        if (error.response.data && error.response.data.message) {
          throw new Error(`Error del servidor: ${error.response.data.message}`);
        }
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      }
      
      throw error;
    }
  },

  actualizarPago: async (id, pagoData) => {
    try {
      // Obtener el token de autenticación
      const token = getAuthToken();
      if (!token) {
        throw new Error('No autorizado: Inicie sesión para realizar esta acción');
      }
      
      // Configurar headers con el token
      const config = {
        headers: {
          'Authorization': token
        }
      };
      
      // Asegurarse de que los campos requeridos estén presentes
      const camposRequeridos = ['contrato_id', 'monto', 'metodo_pago', 'tipo_pago', 'estado', 'fecha_pago', 'fecha_real_pago'];
      for (const campo of camposRequeridos) {
        if (!pagoData.hasOwnProperty(campo) || pagoData[campo] === undefined || pagoData[campo] === '') {
          throw new Error(`El campo '${campo}' es requerido`);
        }
      }
      
      const response = await api.put(`${API_URL}/pagos/${id}`, pagoData, config);
      return response.data;
    } catch (error) {
      // Obtener más detalles sobre el error
      if (error.response) {
        // Si hay un mensaje de error específico en la respuesta, úsalo
        if (error.response.data && error.response.data.message) {
          throw new Error(`Error del servidor: ${error.response.data.message}`);
        }
      }
      
      throw error;
    }
  },

  eliminarPago: async (id) => {
    try {
      await api.delete(`${API_URL}/pagos/${id}`);
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
      throw error;
    }
  }
};

export default pagoService; 