import axios from 'axios';

// Verificar si estamos en desarrollo o producción
const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment 
  ? 'http://localhost:3000/api'  // URL para desarrollo (puerto 3000)
  : process.env.REACT_APP_API_URL || 'http://localhost:3000/api';  // URL para producción

// Configurar axios para manejar errores de conexión
axios.defaults.timeout = 10000; // 10 segundos de timeout
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 500; // Aceptar cualquier status que no sea error del servidor
};

const espacioService = {
  // Obtener todos los espacios
  obtenerEspacios: async () => {
    try {
      console.log('Obteniendo todos los espacios...'); // Debug
      const response = await axios.get(`${API_URL}/espacios`);
      console.log('Respuesta de obtenerEspacios:', response.data); // Debug
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(transformarEspacio);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(transformarEspacio);
      }
      return [];
    } catch (error) {
      console.error('Error al obtener espacios:', error);
      console.error('Detalles del error:', error.response); // Debug
      return [];
    }
  },

  // Obtener un espacio por ID
  obtenerEspacio: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/espacios/${id}`);
      console.log('Respuesta de obtenerEspacio:', response.data); // Debug
      if (response.data) {
        return transformarEspacio(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el espacio:', error);
      return null;
    }
  },

  // Obtener espacios por piso
  obtenerEspaciosPorPiso: async (inmuebleId, pisoId) => {
    try {
      console.log('Obteniendo espacios para inmueble:', inmuebleId, 'y piso:', pisoId);
      const response = await axios.get(`${API_URL}/espacios/inmuebles/${inmuebleId}/pisos/${pisoId}/espacios`);
      console.log('Respuesta completa:', response);
      console.log('Datos de la respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener espacios por piso:', error);
      throw error;
    }
  },

  // Obtener un espacio por su ID
  obtenerEspacioPorId: async (espacioId) => {
    try {
      console.log('Obteniendo espacio con ID:', espacioId);
      const response = await axios.get(`${API_URL}/espacios/${espacioId}`);
      console.log('Datos del espacio:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el espacio por ID:', error);
      throw error;
    }
  },

  // Crear un nuevo espacio
  crearEspacio: async (espacioData) => {
    try {
      console.log('Datos recibidos en crearEspacio:', espacioData);
      
      // Validar que los datos sean un objeto
      if (!espacioData || typeof espacioData !== 'object') {
        console.error('Datos inválidos recibidos:', espacioData);
        throw new Error('Los datos recibidos no son válidos. Se esperaba un objeto con los datos del espacio.');
      }

      // Validar campos requeridos
      const camposRequeridos = ['inmueble_id', 'piso_id', 'tipoEspacio_id', 'nombre'];
      const camposFaltantes = camposRequeridos.filter(campo => !espacioData[campo]);
      
      if (camposFaltantes.length > 0) {
        console.error('Campos requeridos faltantes:', camposFaltantes);
        throw new Error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
      }

      // Construir la URL con la estructura correcta
      const url = `${API_URL}/espacios/inmuebles/${espacioData.inmueble_id}/pisos/${espacioData.piso_id}/espacios`;
      console.log('URL de la petición:', url);

      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Preparar los datos para enviar (excluyendo los IDs que ya están en la URL)
      const datosParaEnviar = {
        tipoEspacio_id: parseInt(espacioData.tipoEspacio_id),
        nombre: espacioData.nombre,
        descripcion: espacioData.descripcion || '',
        precio: parseFloat(espacioData.precio) || 0,
        capacidad: parseInt(espacioData.capacidad) || 0,
        baño: espacioData.baño === 'propio' ? 'propio' : 'compartido',
        estado: '0' // Por defecto disponible
      };

      console.log('Datos a enviar:', datosParaEnviar);

      const response = await axios.post(url, datosParaEnviar, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al crear espacio:', error);
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        // Mostrar el mensaje de error específico del servidor si está disponible
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Error al crear el espacio';
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
        throw new Error('No se pudo conectar con el servidor');
      } else {
        console.error('Error en la configuración de la petición:', error.message);
        throw error;
      }
    }
  },

  // Actualizar un espacio existente
  actualizarEspacio: async (id, espacioData) => {
    try {
      const response = await axios.put(`${API_URL}/espacios/${id}`, espacioData);
      return response.data || null;
    } catch (error) {
      console.error('Error al actualizar espacio:', error);
      return null;
    }
  },

  // Eliminar un espacio
  eliminarEspacio: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/espacios/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error al eliminar espacio:', error);
      return null;
    }
  }
};

// Función auxiliar para transformar los datos del espacio
const transformarEspacio = (espacio) => {
  console.log('Transformando espacio:', espacio); // Debug
  return {
    id: espacio.id,
    piso_id: espacio.piso_id,
    tipoEspacio_id: espacio.tipoEspacio_id,
    nombre: espacio.nombre,
    descripcion: espacio.descripcion,
    precio: parseFloat(espacio.precio),
    capacidad: parseInt(espacio.capacidad),
    bano: espacio.baño === 'propio' ? true : false,
    estado: espacio.estado === '0' ? 'Disponible' : 'Ocupado',
    creado_en: espacio.creado_en
  };
};

export default espacioService;