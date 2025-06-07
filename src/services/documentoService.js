import api from './api';
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

      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      // Agregar el ID y el tipo al FormData
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('documentable_id', documentable_id.toString());
      formData.append('documentable_type', documentable_type);
      
      // Especificar la carpeta destino basada en el tipo de documento
      if (documentable_type === 'gasto') {
        formData.append('carpetaDestino', 'documentos/gasto');
      } else if (documentable_type === 'pago') {
        formData.append('carpetaDestino', 'documentos/pago');
      } else if (documentable_type === 'contrato') {
        formData.append('carpetaDestino', 'documentos/contrato');
      }

      // Si se especifica usar carpeta común
      if (options.usarCarpetaComun) {
        formData.append('usarCarpetaComun', 'true');
      }

      const response = await api.post('/documentos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error;
    }
  },

  // Obtener la URL completa para ver un documento
  getDocumentUrl: (rutaRelativa) => {
    if (!rutaRelativa) return null;
    return `${API_URL}/documentos/ver/${rutaRelativa}`;
  },

  // Obtener la URL completa para descargar un documento
  getDownloadUrl: (rutaRelativa) => {
    if (!rutaRelativa) return null;
    return `${API_URL}/documentos/descargar/${rutaRelativa}`;
  },

  // Ver documento
  verDocumento: async (rutaRelativa) => {
    try {
      if (!rutaRelativa) {
        throw new Error('Ruta del documento no disponible');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const url = `${API_URL}/documentos/ver/${rutaRelativa}`;
      window.open(`${url}?token=${token}`, '_blank');
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Descargar documento
  descargarDocumento: async (rutaRelativa, nombreArchivo) => {
    try {
      if (!rutaRelativa) {
        throw new Error('Ruta del documento no disponible');
      }

      const response = await api.get(`/documentos/descargar/${rutaRelativa}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = nombreArchivo || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default documentoService;
