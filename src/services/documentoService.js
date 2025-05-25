import api from './api';
import { API_URL } from './authService';

const documentoService = {
  // Obtener todos los documentos
  obtenerDocumentos: async () => {
    try {
      const response = await api.get(`${API_URL}/documentos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
      throw error;
    }
  },

  // Obtener un documento por ID
  obtenerDocumentoPorId: async (id) => {
    try {
      const response = await api.get(`${API_URL}/documentos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el documento:', error);
      throw error;
    }
  },

  // Obtener documentos por documentable_id y documentable_type(contrato,pago,gasto)
  obtenerDocumentosPorDocumentable: async (documentable_id, documentable_type) => {
    try {
      const response = await api.get(`${API_URL}/documentos/documentable/${documentable_id}/${documentable_type}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
      throw error;
    }
  },

  // Crear un documento usando fetch directamente
  crearDocumento: async (documento) => {
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      // Crear un objeto simple con los datos exactos
      const documentoEnviar = {
        nombre: documento.nombre,
        ruta: documento.ruta,
        documentable_id: parseInt(documento.documentable_id),
        documentable_type: documento.documentable_type
      };

      console.log('Enviando datos al backend:', JSON.stringify(documentoEnviar));
      const url = `${API_URL}/documentos`;
      console.log('URL:', url);

      // Usar fetch con el token en el header
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(documentoEnviar)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.mensaje || response.statusText}`);
      }

      const data = await response.json();
      console.log('Respuesta del backend:', data);
      return data;
    } catch (error) {
      console.error('Error al crear el documento:', error);
      throw error;
    }
  },

  // Actualizar un documento
  actualizarDocumento: async (id, documento) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const response = await fetch(`${API_URL}/documentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(documento)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.mensaje || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al actualizar el documento:', error);
      throw error;
    }
  },

  // Eliminar un documento
  eliminarDocumento: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const response = await fetch(`${API_URL}/documentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.mensaje || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
      throw error;
    }
  },

  // Obtener documentos por documentable_id y documentable_type
  obtenerDocumentosPorTipo: async (documentable_id, documentable_type) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const response = await fetch(`${API_URL}/documentos/documentable/${documentable_id}/${documentable_type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.mensaje || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
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

      console.log('Preparando subida de archivo con los siguientes datos:');
      console.log('- Archivo:', file ? file.name : 'No hay archivo');
      console.log('- ID:', documentable_id);
      console.log('- Tipo:', documentable_type);
      console.log('- Opciones:', options);

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

      console.log('Contenido del FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'archivo' ? 'Archivo presente' : pair[1]));
      }

      // Enviar la solicitud al servidor
      const response = await fetch(`${API_URL}/documentos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // Log de la respuesta HTTP
      console.log('Respuesta HTTP:', response.status, response.statusText);
      
      const responseData = await response.text();
      console.log('Texto de respuesta:', responseData);
      
      let data;
      try {
        data = JSON.parse(responseData);
      } catch (e) {
        console.error('Error al parsear la respuesta JSON:', e);
        throw new Error(`Error al procesar la respuesta del servidor: ${responseData}`);
      }

      if (!response.ok || !data.ruta) {
        console.error('Error detallado del servidor:', data);
        throw new Error(data.mensaje || data.error || 'Error al subir el archivo');
      }

      return data;
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
      console.log('URL para ver documento:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Abrir el documento en una nueva pestaña con el token en la URL
      window.open(`${url}?token=${token}`, '_blank');
      return true;
    } catch (error) {
      console.error('Error al ver documento:', error);
      throw error;
    }
  },

  // Descargar documento
  descargarDocumento: async (rutaRelativa, nombreArchivo) => {
    try {
      if (!rutaRelativa) {
        throw new Error('Ruta del documento no disponible');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      console.log('Iniciando descarga:', { rutaOriginal: rutaRelativa, nombreArchivo });
      const url = `${API_URL}/documentos/descargar/${rutaRelativa}`;
      console.log('URL de descarga:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
      }

      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Crear URL del blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Crear un elemento <a> temporal
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = nombreArchivo || 'documento.pdf';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar la URL del blob
      window.URL.revokeObjectURL(downloadUrl);
      
      return true;
    } catch (error) {
      console.error('Error al descargar documento:', error);
      throw error;
    }
  }
};

export default documentoService;
