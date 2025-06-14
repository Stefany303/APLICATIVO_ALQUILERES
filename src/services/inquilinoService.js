import api from './api';

const inquilinoService = {
  // Obtener todos los inquilinos
  obtenerInquilinos: async () => {
    try {
      const response = await api.get('/personas/inquilinos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener inquilinos:', error);
      throw error;
    }
  },

  // Obtener un inquilino por ID
  obtenerInquilino: async (id) => {
    try {
      const response = await api.get(`/personas/inquilinos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener inquilino:', error);
      throw error;
    }
  },

  // Crear un nuevo inquilino
  crearInquilino: async (inquilinoData) => {
    try {
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

      // Validar que el email tenga un formato válido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inquilinoData.email)) {
        throw new Error('El email no tiene un formato válido');
      }
      // Validar que el teléfono tenga un formato válido (opcional)
      const telefonoRegex = /^\d{9}$/; // Ejemplo: 10 dígitos
      if (inquilinoData.telefono && !telefonoRegex.test(inquilinoData.telefono)) {
        throw new Error('El teléfono no tiene un formato válido (debe tener 9 dígitos)');
      }
      // Validar que el documento tenga un formato válido (opcional)
      const documentoRegex = /^\d{8,10}$/; // Ejemplo: 8 a 10 dígitos
      if (inquilinoData.documento && !documentoRegex.test(inquilinoData.documento)) {
        throw new Error('El documento no tiene un formato válido (debe tener entre 8 y 10 dígitos)');
      }
      // Validar que el tipo de documento sea válido (opcional)
      const tiposDocumentoValidos = ['DNI', 'Pasaporte', 'Cédula', 'RUC'];
      if (inquilinoData.tipoDocumento && !tiposDocumentoValidos.includes(inquilinoData.tipoDocumento)) {
        throw new Error(`El tipo de documento no es válido (debe ser uno de los siguientes: ${tiposDocumentoValidos.join(', ')})`);
      }
      // Validar que el nombre y apellido no contengan caracteres especiales
      const nombreRegex = /^[a-zA-Z\s]+$/; // Solo letras y espacios
      if (!nombreRegex.test(inquilinoData.nombre)) {
        throw new Error('El nombre no tiene un formato válido (solo letras y espacios)');
      }
      if (!nombreRegex.test(inquilinoData.apellido)) {  
        throw new Error('El apellido no tiene un formato válido (solo letras y espacios)');
      }
      // Validar que el monto mensual sea un número válido
      if (isNaN(inquilinoData.montoMensual) || parseFloat(inquilinoData.montoMensual) <= 0) {
        throw new Error('El monto mensual debe ser un número válido y mayor que 0');
      }
      // Validar que el depósito sea un número válido (opcional)
      if (inquilinoData.deposito && (isNaN(inquilinoData.deposito) || parseFloat(inquilinoData.deposito) < 0)) {
        throw new Error('El depósito debe ser un número válido y mayor o igual que 0');
      }
      // Validar que las fechas tengan un formato válido (opcional)
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/; // Formato YYYY-MM-DD
      if (inquilinoData.fechaInicio && !fechaRegex.test(inquilinoData.fechaInicio)) {
        throw new Error('La fecha de inicio no tiene un formato válido (debe ser YYYY-MM-DD)');
      }
      if (inquilinoData.fechaFin && !fechaRegex.test(inquilinoData.fechaFin)) {
        throw new Error('La fecha de fin no tiene un formato válido (debe ser YYYY-MM-DD)');
      }
      // Validar que la fecha de inicio sea anterior a la fecha de fin (opcional)
      if (inquilinoData.fechaInicio && inquilinoData.fechaFin) {
        const fechaInicio = new Date(inquilinoData.fechaInicio);
        const fechaFin = new Date(inquilinoData.fechaFin);
        if (fechaInicio >= fechaFin) {
          throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
        }
      }
      // Validar que el inmueble_id sea un número válido
      const inmuebleId = parseInt(inquilinoData.inmuebleId);
      if (!inmuebleId || isNaN(inmuebleId)) {
        throw new Error('El inmueble_id es requerido y debe ser un número válido');
      }

      // Validar que el espacio_id sea un número válido
      const espacioId = parseInt(inquilinoData.espacioId);
    
      if (!espacioId || isNaN(espacioId)) {
        throw new Error('El espacio_id es requerido y debe ser un número válido');
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

      const personaResponse = await api.post('/personas', personaData);

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

      const contratoResponse = await api.post('/contratos', contratoData);

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
      const response = await api.put(`/inquilinos/${id}`, inquilinoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar inquilino:', error);
      throw error;
    }
  },

  // Eliminar un inquilino
  eliminarInquilino: async (id) => {
    try {
      const response = await api.delete(`/inquilinos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar inquilino:', error);
      throw error;
    }
  }
};

export default inquilinoService; 