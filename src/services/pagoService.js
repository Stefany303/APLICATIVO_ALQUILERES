import api from './api';
import { API_URL, getAuthToken } from './authService';

const pagoService = {
  obtenerPagos: async () => {
    try {
      const response = await api.get(`${API_URL}/pagos`);
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
        console.error('No hay token de autenticación disponible para crear el pago');
        throw new Error('No autorizado: Inicie sesión para realizar esta acción');
      }
      
      // Configurar headers con el token
      const config = {
        headers: {
          'Authorization': token
        }
      };
      
      console.log('Datos del pago a enviar:', JSON.stringify(pagoData, null, 2));
      const response = await api.post(`${API_URL}/pagos`, pagoData, config);
      console.log('Respuesta del servidor al crear pago:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al crear el pago:', error);
      
      // Obtener más detalles sobre el error
      if (error.response) {
        // El servidor respondió con un código de estado que no está en el rango 2xx
        console.error('Detalles del error del servidor:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          endpoint: `${API_URL}/pagos`
        });
        
        // Si hay un mensaje de error específico en la respuesta, úsalo
        if (error.response.data && error.response.data.message) {
          throw new Error(`Error del servidor: ${error.response.data.message}`);
        }
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
        throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      }
      
      throw error;
    }
  },

  actualizarPago: async (id, pagoData) => {
    try {
      const response = await api.put(`${API_URL}/pagos/${id}`, pagoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
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