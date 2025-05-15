import api from './api';
import { API_URL, getAuthToken } from './authService';

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

      // Usar fetch en lugar de axios
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken() || ''
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
      const response = await api.put(`${API_URL}/documentos/${id}`, documento);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el documento:', error);
      throw error;
    }
  },

  // Eliminar un documento
  eliminarDocumento: async (id) => {
    try {
      const response = await api.delete(`${API_URL}/documentos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
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

      // Agregar el ID y el tipo al FormData en lugar de usar headers personalizados
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('documentable_id', documentable_id.toString());
      formData.append('documentable_type', documentable_type);
      
      // Especificar la carpeta destino basada en el tipo de documento
      if (documentable_type === 'gasto') {
        // Para gastos, guardar en public/documentos/gasto
        formData.append('carpetaDestino', 'documentos/gasto');
        console.log('Documento de gasto: usando carpeta específica para gastos');
      } else if (documentable_type === 'pago') {
        // Para pagos, guardar en public/documentos/pago
        formData.append('carpetaDestino', 'documentos/pago');
        console.log('Documento de pago: usando carpeta específica para pagos');
      } else {
        // Para otros tipos, usar la carpeta común si se especifica
        if (options.usarCarpetaComun) {
          formData.append('usarCarpetaComun', 'true');
          console.log('Documento de otro tipo: usando carpeta común');
        }
      }

      console.log('Contenido del FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'archivo' ? 'Archivo presente' : pair[1]));
      }

      console.log(`Enviando solicitud a: ${API_URL}/documentos/upload`);
      
      // Usamos solo la cabecera de Authorization, sin las personalizadas
      const response = await fetch(`${API_URL}/documentos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthToken() || ''
        },
        body: formData
      });

      // Log de la respuesta HTTP antes de procesarla
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

      if (!response.ok) {
        console.error('Error detallado del servidor:', data);
        throw new Error(`Error ${response.status}: ${data.mensaje || data.error || response.statusText}`);
      }

      console.log('Respuesta del backend:', data);
      return data;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error;
    }
  }
};

export default documentoService;
