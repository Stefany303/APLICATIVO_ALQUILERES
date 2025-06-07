import api from './api';
import tipoEspacioService from './tipoespacioService';

// Definir endpoints base para espacios
const ENDPOINT_BASE = '/espacios';
const ENDPOINT_INMUEBLES = ENDPOINT_BASE + '/inmuebles';

const espacioService = {
  // Obtener todos los espacios (ruta /api/espacios)
  obtenerEspacios: async () => {
    try {
      const response = await api.get(ENDPOINT_BASE);
      return response.data;
    } catch (error) {
      console.error('Error al obtener espacios:', error);
      throw error;
    }
  },

  // Obtener todos los espacios con tipo incluido (ruta /api/obtenerespacios)
  obtenerEspaciosConTipo: async () => {
    try {
      const response = await api.get('/obtenerespacios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener espacios con tipo:', error);
      throw error;
    }
  },

  // Obtener espacios por piso
  obtenerEspaciosPorPiso: async (inmuebleId, pisoId) => {
    try {
      const response = await api.get(`${ENDPOINT_INMUEBLES}/${inmuebleId}/pisos/${pisoId}/espacios`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener espacios del piso ${pisoId}:`, error);
      throw error;
    }
  },

  // Obtener un espacio por ID
  obtenerEspacioPorId: async (inmuebleId, pisoId, espacioId) => {
    try {
      const response = await api.get(`${ENDPOINT_INMUEBLES}/${inmuebleId}/pisos/${pisoId}/espacios/${espacioId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener espacio ${espacioId}:`, error);
      throw error;
    }
  },

  // Crear un nuevo espacio
  crearEspacio: async (espacioData) => {
    try {
      // Verificar autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión nuevamente.');
      }

      if (!espacioData.inmueble_id || !espacioData.piso_id) {
        throw new Error('Se requiere el ID del inmueble y del piso');
      }

      // Preparar datos según la estructura esperada por el backend
      const datosParaEnviar = {
        piso_id: espacioData.piso_id,
        nombre: espacioData.nombre,
        tipoEspacio_id: espacioData.tipoEspacio_id,
        descripcion: espacioData.descripcion,
        precio: parseFloat(espacioData.precio),
        capacidad: parseInt(espacioData.capacidad),
        baño: espacioData.bano ? 'propio' : 'compartido',
        estado: espacioData.estado || 0
      };

      // Usar la instancia de api que ya tiene configurada la autenticación y manejo de errores
      const response = await api.post(
        `${ENDPOINT_INMUEBLES}/${espacioData.inmueble_id}/pisos/${espacioData.piso_id}/espacios`,
        datosParaEnviar
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al crear espacio:', error);
      if (error.response) {
        console.error('Respuesta del servidor:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  },

  // Actualizar un espacio
  actualizarEspacio: async (inmuebleId, pisoId, espacioId, espacioData) => {
    try {
      // Si el objeto incluye tipoEspacio como texto, convertirlo a ID
      let datosActualizados = { ...espacioData };
      
      if (espacioData.tipoEspacio) {
        try {
          const tiposEspacio = await tipoEspacioService.obtenerTodos();
          const tipoEncontrado = tiposEspacio.find(
            tipo => tipo.nombre === espacioData.tipoEspacio
          );
          
          if (tipoEncontrado) {
            datosActualizados.tipoEspacio_id = tipoEncontrado.id;
            delete datosActualizados.tipoEspacio;
          }
        } catch (error) {
          console.error('Error al obtener tipos de espacio para actualización:', error);
        }
      }

      // Convertir valores
      if (datosActualizados.precio) {
        datosActualizados.precio = parseFloat(datosActualizados.precio);
      }
      
      if (datosActualizados.capacidad) {
        datosActualizados.capacidad = parseInt(datosActualizados.capacidad);
      }
      
      if (datosActualizados.bano !== undefined) {
        datosActualizados.baño = datosActualizados.bano ? 'propio' : 'compartido';
        delete datosActualizados.bano;
      }

      // Asegurar que el estado se procese correctamente si está presente
      if (datosActualizados.estado !== undefined) {
        datosActualizados.estado = parseInt(datosActualizados.estado);
      }

      const response = await api.put(
        `${ENDPOINT_INMUEBLES}/${inmuebleId}/pisos/${pisoId}/espacios/${espacioId}`,
        datosActualizados
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar espacio ${espacioId}:`, error);
      throw error;
    }
  },

  // Eliminar un espacio
  eliminarEspacio: async (inmuebleId, pisoId, espacioId) => {
    try {
      const response = await api.delete(
        `${ENDPOINT_INMUEBLES}/${inmuebleId}/pisos/${pisoId}/espacios/${espacioId}`
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar espacio ${espacioId}:`, error);
      throw error;
    }
  }
};

export default espacioService; 