import axios from 'axios';
import api from './api';
import { API_URL, getAuthToken } from './authService';

// Verificar si estamos en desarrollo o producción
const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL_LOCAL = isDevelopment 
  ? 'http://localhost:3000/api'  // URL para desarrollo (puerto 3000)
  : process.env.REACT_APP_API_URL || 'http://localhost:3000/api';  // URL para producción

// Configurar axios para manejar errores de conexión
axios.defaults.timeout = 10000; // 10 segundos de timeout
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 500; // Aceptar cualquier status que no sea error del servidor
};

const inquilinoService = {
  // Obtener todos los inquilinos
  obtenerInquilinos: async () => {
    try {
      const response = await api.get(`${API_URL}/inquilinos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener inquilinos:', error);
      throw error;
    }
  },

  // Obtener un inquilino por ID
  obtenerInquilino: async (id) => {
    try {
      const response = await api.get(`${API_URL}/inquilinos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener inquilino:', error);
      throw error;
    }
  },

  // Crear un nuevo inquilino
  crearInquilino: async (inquilinoData) => {
    try {
      console.log('Datos recibidos en crearInquilino:', inquilinoData);
      console.log('URL del API:', API_URL);
      
      // Validar que los datos sean un objeto
      if (!inquilinoData || typeof inquilinoData !== 'object') {
        throw new Error('Los datos recibidos no son válidos');
      }

      // Validar campos requeridos para persona
      const camposRequeridosPersona = ['nombre', 'apellido', 'email', 'telefono', 'documento', 'tipoDocumento'];
      const camposFaltantes = camposRequeridosPersona.filter(campo => !inquilinoData[campo]);
      
      if (camposFaltantes.length > 0) {
        throw new Error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
      }

      // Validar campos requeridos para el contrato
    /*  if (!inquilinoData.espacio_id) {
        throw new Error('El espacio_id es requerido para crear el contrato');
      }*/

      // Validar que el espacio_id sea un número válido
      const espacioId = parseInt(inquilinoData.espacioId);
      console.log('=== VALIDACIÓN DE ESPACIO ===');
      console.log('Espacio ID recibido del formulario:', inquilinoData.espacioId);
      console.log('Espacio ID convertido:', espacioId);
      
      if (!espacioId || isNaN(espacioId)) {
        throw new Error('El espacio_id es requerido y debe ser un número válido');
      }
      console.log('=== FIN VALIDACIÓN ===');

      // Obtener el token usando getAuthToken
      const token = getAuthToken();
      console.log('Token obtenido:', token);

      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      // 1. Crear la persona
      const personaData = {
        nombre: inquilinoData.nombre,
        apellido: inquilinoData.apellido,
        email: inquilinoData.email,
        telefono: inquilinoData.telefono,
        dni: inquilinoData.documento,
        direccion: inquilinoData.direccion || '',
        rol: 'inquilino'
      };

      console.log('=== DATOS DE LA PERSONA ===');
      console.log('Datos a enviar:', JSON.stringify(personaData, null, 2));
      console.log('=== FIN DATOS ===');

      const personaResponse = await api.post(`${API_URL}/personas`, personaData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Persona creada:', personaResponse.data);

      // 2. Crear el contrato
      const contratoData = {
        inquilino_id: personaResponse.data.id,
        espacio_id: espacioId,
        inmueble_id: parseInt(inquilinoData.inmuebleId),
        fecha_inicio: inquilinoData.fechaInicio,
        fecha_fin: inquilinoData.fechaFin,
        monto_alquiler: parseFloat(inquilinoData.montoMensual),
        monto_garantia: parseFloat(inquilinoData.deposito || 0),
        descripcion: inquilinoData.observaciones || '',
        documento: inquilinoData.documento,
        estado: 'activo',
        fecha_pago: inquilinoData.fechaInicio
      };

      console.log('=== DATOS DEL CONTRATO ===');
      console.log('1. Datos recibidos del formulario:', JSON.stringify(inquilinoData, null, 2));
      console.log('2. ID de la persona creada:', personaResponse.data.id);
      console.log('3. Espacio ID seleccionado:', espacioId);
      console.log('4. Inmueble ID:', parseInt(inquilinoData.inmuebleId));
      console.log('5. Datos del contrato a enviar:', JSON.stringify(contratoData, null, 2));
      console.log('=== FIN DATOS ===');

      console.log('Enviando petición POST a la API...');
      const contratoResponse = await api.post(`${API_URL}/contratos`, contratoData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Respuesta del servidor:', JSON.stringify(contratoResponse.data, null, 2));

      return {
        persona: personaResponse.data,
        contrato: contratoResponse.data
      };

    } catch (error) {
      console.error('Error al crear inquilino:', error);
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  },

  // Actualizar un inquilino existente
  actualizarInquilino: async (id, inquilinoData) => {
    try {
      const response = await api.put(`${API_URL}/inquilinos/${id}`, inquilinoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar inquilino:', error);
      throw error;
    }
  },

  // Eliminar un inquilino
  eliminarInquilino: async (id) => {
    try {
      const response = await api.delete(`${API_URL}/inquilinos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar inquilino:', error);
      throw error;
    }
  }
};

export default inquilinoService; 