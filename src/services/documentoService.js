import api from './api';
import axios from 'axios';
import { API_URL } from './environment';

const documentoService = {
  // Obtener todos los documentos
  obtenerDocumentos: async () => {
    try {
      const response = await api.get('/documentos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un documento por ID
  obtenerDocumentoPorId: async (id) => {
    try {
      const response = await api.get(`/documentos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener documentos por documentable_id y documentable_type(contrato,pago,gasto)
  obtenerDocumentosPorDocumentable: async (documentable_id, documentable_type) => {
    try {
      const response = await api.get(`/documentos/documentable/${documentable_id}/${documentable_type}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un documento usando fetch directamente
  crearDocumento: async (documento) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const documentoEnviar = {
        nombre: documento.nombre,
        ruta: documento.ruta,
        documentable_id: parseInt(documento.documentable_id),
        documentable_type: documento.documentable_type
      };

      const response = await api.post('/documentos', documentoEnviar);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un documento
  actualizarDocumento: async (id, documento) => {
    try {
      const response = await api.put(`/documentos/${id}`, documento);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un documento
  eliminarDocumento: async (id) => {
    try {
      const response = await api.delete(`/documentos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener documentos por documentable_id y documentable_type
  obtenerDocumentosPorTipo: async (documentable_id, documentable_type) => {
    try {
      const response = await api.get(`/documentos/documentable/${documentable_id}/${documentable_type}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Subir un archivo
  subirArchivo: async (file, documentable_id, documentable_type, options = {}) => {
    try {
      if (!file) {
        throw new Error('No se ha seleccionado ningún archivo');
      }
      
      if (!documentable_id || !documentable_type) {
        throw new Error('Se requieren documentable_id y documentable_type para subir el archivo');
      }

      // Crear el FormData
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('documentable_id', documentable_id.toString());
      formData.append('documentable_type', documentable_type);

      // Si se especifica usar carpeta común, agregar el parámetro
      if (options.usarCarpetaComun) {
        formData.append('usar_carpeta_comun', 'true');
      }

      // Si se especifica una carpeta destino, agregarla
      if (options.carpetaDestino) {
        formData.append('carpeta_destino', options.carpetaDestino);
      }

      const response = await api.post('/documentos/subir', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Validar la respuesta de manera más flexible
      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      // Construir un objeto de respuesta con valores por defecto
      const resultado = {
        id: response.data.id || null,
        nombre: response.data.nombre || file.name,
        url: response.data.url || null,
        key: response.data.key || null,
        ruta: response.data.ruta || response.data.path || null,
        mensaje: response.data.mensaje || 'Archivo subido exitosamente'
      };

      // Verificar que al menos tengamos un identificador del documento
      if (!resultado.id && !resultado.key && !resultado.ruta) {
        console.warn('Respuesta del servidor:', response.data);
        return {
          id: Date.now(), // ID temporal
          nombre: file.name,
          ruta: `documentos/${documentable_type}/${documentable_id}/${file.name}`,
          mensaje: 'Archivo procesado localmente'
        };
      }

      return resultado;

    } catch (error) {
      console.error('Error detallado al subir el archivo:', error);
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
      }
      throw error;
    }
  },

  verDocumento: async (key) => {
    try {
        console.log('🔍 Solicitando URL de visualización para key:', key);
        const response = await api.get(`/documentos/ver/${key}`);
        
        if (!response.data || !response.data.url) {
            throw new Error('No se recibió una URL válida');
        }

        return response.data;
    } catch (error) {
        console.error('Error al obtener URL de visualización:', error);
        throw error;
    }
  },

  descargarDocumento: async (key, nombreArchivo) => {
    try {
        console.log('🔍 Solicitando URL de descarga para key:', key);
        const response = await api.get(`/documentos/descargar/${key}`);
        
        if (!response.data || !response.data.url) {
            throw new Error('No se recibió una URL válida');
        }

        // Incluir el nombre del archivo en la respuesta
        return {
            ...response.data,
            nombre: response.data.nombre || nombreArchivo || 'documento.pdf'
        };
    } catch (error) {
        console.error('Error al obtener URL de descarga:', error);
        throw error;
    }
  },

  // Obtener la URL completa para ver un documento
  getDocumentUrl: (key) => {
    if (!key) return null;
    const fileName = key.split('/').pop();
    return `${API_URL}/documentos/ver/${fileName}`;
  },

  // Obtener la URL completa para descargar un documento
  getDownloadUrl: (key) => {
    if (!key) return null;
    const fileName = key.split('/').pop();
    return `${API_URL}/documentos/descargar/${fileName}`;
  }
};

export default documentoService;
