import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from "react-icons/fi";
import Swal from 'sweetalert2';
import inquilinoService from '../../services/inquilinoService';
import inmuebleService from '../../services/inmuebleService';
import contratoService from '../../services/contratoService';
import espacioService from '../../services/espacioService';
import pagoService from '../../services/pagoService';
import personaService from '../../services/personaService';
import api from '../../services/api';
import { API_URL, getAuthToken } from '../../services/authService';
import { useAuth } from "../../utils/AuthContext";

const InquilinosRegistrar = () => {
  const { user, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificandoDocumento, setVerificandoDocumento] = useState(false);
  const [error, setError] = useState(null);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [inquilinoExistente, setInquilinoExistente] = useState(null);
  const [documentoVerificado, setDocumentoVerificado] = useState(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState({
    tipo: '',
    precio: 0
  });
  
  // Obtener la fecha actual en formato YYYY-MM-DD para prellenar la fecha de inicio
  const fechaActual = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    documento: '',
    tipoDocumento: 'DNI',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    inmuebleId: '',
    pisoId: '',
    espacioId: '',
    fechaInicio: fechaActual, // Prellenar con la fecha actual
    fechaFin: '',
    montoMensual: '',
    deposito: '',
    observaciones: ''
  });
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState({
    documento: '',
    tipoDocumento: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    inmuebleId: '',
    pisoId: '',
    espacioId: '',
    fechaInicio: '',
    fechaFin: '',
    montoMensual: '',
    deposito: ''
  });

  // Cargar inmuebles al montar el componente
  useEffect(() => {
    const cargarInmuebles = async () => {
      try {
        setLoading(true);
        const data = await inmuebleService.obtenerInmuebles();
        if (data && Array.isArray(data)) {
          setInmuebles(data);
        } else {
          setInmuebles([]);
          setError('No se pudieron cargar los inmuebles');
        }
      } catch (error) {
        console.error('Error al cargar inmuebles:', error);
        setError('Error al cargar los inmuebles');
        setInmuebles([]);
      } finally {
        setLoading(false);
      }
    };

    cargarInmuebles();
  }, []);

  // Cargar pisos cuando se selecciona un inmueble
  useEffect(() => {
    const cargarPisos = async () => {
      if (formData.inmuebleId) {
        try {
          setLoading(true);
          const data = await inmuebleService.obtenerPisosPorInmueble(formData.inmuebleId);
          if (data && Array.isArray(data)) {
            setPisos(data);
          } else {
            setPisos([]);
            setError('No se pudieron cargar los pisos');
          }
        } catch (error) {
          console.error('Error al cargar pisos:', error);
          setError('Error al cargar los pisos');
          setPisos([]);
        } finally {
          setLoading(false);
        }
      } else {
        setPisos([]);
        setEspacios([]);
      }
    };

    cargarPisos();
  }, [formData.inmuebleId]);

  // Cargar espacios cuando se selecciona un piso
  useEffect(() => {
    const cargarEspacios = async () => {
      if (formData.pisoId && formData.inmuebleId) {
        try {
          setLoading(true);
          //console.log('Cargando espacios para inmueble:', formData.inmuebleId, 'y piso:', formData.pisoId);
          const data = await espacioService.obtenerEspaciosPorPiso(formData.inmuebleId, formData.pisoId);
          
          if (data && Array.isArray(data)) {
            setEspacios(data);
          } else {
           // console.log('No se recibieron datos válidos de espacios');
            setEspacios([]);
            setError('No se pudieron cargar los espacios');
          }
        } catch (error) {
          console.error('Error al cargar espacios:', error);
          setError('Error al cargar los espacios');
          setEspacios([]);
        } finally {
          setLoading(false);
        }
      } else {
        setEspacios([]);
      }
    };

    cargarEspacios();
  }, [formData.pisoId, formData.inmuebleId]);

  // Verificar si existe un inquilino con el documento ingresado
  const verificarDocumento = async (documento) => {
    if (!documento || documento.length < 8) {
      return;
    }

    try {
      setVerificandoDocumento(true);
      const resultado = await personaService.obtenerPersonaPorDocumento(documento);
      
      if (resultado && resultado.id) {
        //console.log('Inquilino encontrado:', resultado);
        setInquilinoExistente(resultado);
        
        // Actualizar el formulario con los datos del inquilino
        setFormData(prevData => ({
          ...prevData,
          nombre: resultado.nombre || '',
          apellido: resultado.apellido || '',
          email: resultado.email || '',
          telefono: resultado.telefono || '',
          direccion: resultado.direccion || '',
          documento: resultado.dni || documento
        }));
        
        Swal.fire({
          title: '¡Inquilino encontrado!',
          text: `Se ha encontrado un inquilino registrado con el documento ${documento}. Sus datos han sido cargados automáticamente.`,
          icon: 'success',
          confirmButtonText: 'Continuar con el contrato'
        });
        
        setDocumentoVerificado(true);
      } else {
        //console.log('No se encontró inquilino con el documento:', documento);
        setInquilinoExistente(null);
        setDocumentoVerificado(true);
        
        Swal.fire({
          title: 'Inquilino nuevo',
          text: 'No se encontró un inquilino con este documento. Por favor, complete los datos para registrar un nuevo inquilino.',
          icon: 'info',
          confirmButtonText: 'Continuar con el registro'
        });
      }
    } catch (error) {
      console.error('Error al verificar documento:', error);
      setInquilinoExistente(null);
      setDocumentoVerificado(true);
      
      Swal.fire({
        title: 'Inquilino nuevo',
        text: 'No se encontró un inquilino con este documento. Por favor, complete los datos para registrar un nuevo inquilino.',
        icon: 'info',
        confirmButtonText: 'Continuar con el registro'
      });
    } finally {
      setVerificandoDocumento(false);
    }
  };

  // Manejar evento de verificación al presionar Enter en el campo de documento
  const handleDocumentoKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verificarDocumento(formData.documento);
    }
  };

  // Manejar evento de verificación al perder el foco del campo de documento
  const handleDocumentoBlur = () => {
    if (formData.documento && !documentoVerificado) {
      verificarDocumento(formData.documento);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'documento':
        if (!value) return 'El documento es requerido';
        if (!/^\d+$/.test(value)) return 'El documento debe contener solo números';
        if (value.length < 8) return 'El documento debe tener al menos 8 dígitos';
        if (value.length > 20) return 'El documento no puede tener más de 20 dígitos';
        return '';
      case 'tipoDocumento':
        return value ? '' : 'El tipo de documento es requerido';
      case 'nombre':
        return value ? '' : 'El nombre es requerido';
      case 'apellido':
        return value ? '' : 'El apellido es requerido';
      case 'email':
        if (!value) return 'El email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Por favor ingrese un email válido';
        return '';
      case 'telefono':
        if (!value) return 'El teléfono es requerido';
        const telefonoLimpio = value.replace(/\D/g, '');
        if (telefonoLimpio.length < 9) return 'El teléfono debe contener al menos 9 dígitos';
        if (telefonoLimpio.length > 12) return 'El teléfono no puede tener más de 12 dígitos';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si se está modificando el documento, resetear la verificación
    if (name === 'documento') {
      setDocumentoVerificado(false);
      setInquilinoExistente(null);
    }

    // Lógica especial para cuando se selecciona un espacio
    if (name === 'espacioId') {
      const espacioSelec = espacios.find(esp => esp.id.toString() === value.toString());
      if (espacioSelec) {
        setEspacioSeleccionado({
          tipo: espacioSelec.tipo_espacio,
          precio: parseFloat(espacioSelec.precio)
        });
        // Actualizar automáticamente el monto mensual con el precio del espacio
        setFormData(prev => ({
          ...prev,
          [name]: value,
          montoMensual: espacioSelec.precio
        }));
      } else {
        setEspacioSeleccionado({ tipo: '', precio: 0 });
      }
    }
    
    // Limitar la longitud de los campos numéricos
    if (name === 'telefono') {
      // Solo permitir números
      const soloNumeros = value.replace(/\D/g, '');
      if (soloNumeros.length > 12) return;
      
      // Actualizar el estado del formulario solo con números
      setFormData(prev => ({
        ...prev,
        [name]: soloNumeros
      }));

      // Validar el campo
      const error = validateField(name, soloNumeros);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
      return;
    }

    if (name === 'documento') {
      // Solo permitir números
      const soloNumeros = value.replace(/\D/g, '');
      if (soloNumeros.length > 20) return;
      
      // Actualizar el estado del formulario solo con números
      setFormData(prev => ({
        ...prev,
        [name]: soloNumeros
      }));

      // Validar el campo
      const error = validateField(name, soloNumeros);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
      return;
    }
    
    // Validar el campo que está cambiando
    const error = validateField(name, value);
    
    // Actualizar el estado de errores
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Actualizar el estado del formulario
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    // Si el documento no ha sido verificado aún, verificarlo primero
    if (!documentoVerificado && formData.documento) {
      verificarDocumento(formData.documento);
      return;
    }
    
    // Validar todos los campos del primer paso
    const camposPrimerPaso = ['documento', 'tipoDocumento', 'nombre', 'apellido', 'email', 'telefono'];
    let hasErrors = false;

    camposPrimerPaso.forEach(campo => {
      const error = validateField(campo, formData[campo]);
      if (error) {
        setFormErrors(prev => ({ ...prev, [campo]: error }));
        hasErrors = true;
      }
    });

    if (hasErrors) {
      Swal.fire({
        title: 'Error de validación',
        text: 'Por favor corrija los errores antes de continuar',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  // Función para calcular las fechas de pago mensuales entre fecha de inicio y fin
  const calcularFechasPago = (fechaInicio, fechaFin) => {
    const fechas = [];
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Obtener día del mes de la fecha de inicio
    const diaDelMes = inicio.getDate();
    
    // Clonar la fecha de inicio para no modificarla
    let fechaActual = new Date(inicio);
    
    // Generar fechas hasta un mes antes de la fecha final
    while (fechaActual < fin) {
      fechas.push(new Date(fechaActual));
      
      // Avanzar al siguiente mes
      fechaActual.setMonth(fechaActual.getMonth() + 1);
      
      // Ajustar al mismo día del mes (considerando meses con menos días)
      const ultimoDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).getDate();
      fechaActual.setDate(Math.min(diaDelMes, ultimoDiaDelMes));
    }
    
    return fechas;
  };

  // Función para generar los pagos mensuales
  const generarPagosMensuales = async (contratoId, montoMensual, fechaInicio, fechaFin) => {
    // Si es un Local, generar los dos pagos especiales
    if (espacioSeleccionado.tipo === 'Local') {
      const montoPrimerPago = parseFloat(montoMensual) * 0.3; // 30% del monto
      const montoSegundoPago = parseFloat(montoMensual) * 0.7; // 70% del monto
      
      // Primer pago (30% - fecha actual)
      const primerPago = {
        contrato_id: parseInt(contratoId),
        monto: montoPrimerPago,
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo_pago: "EFECTIVO",
        tipo_pago: "ALQUILER",
        estado: "PENDIENTE",
        observacion: "Primer pago - 30% del alquiler",
        fecha_registro: new Date().toISOString().split('T')[0],
        usuario_id: user?.id || null
      };

      // Segundo pago (70% - fecha de inicio)
      const segundoPago = {
        contrato_id: parseInt(contratoId),
        monto: montoSegundoPago,
        fecha_pago: fechaInicio,
        metodo_pago: "EFECTIVO",
        tipo_pago: "ALQUILER",
        estado: "PENDIENTE",
        observacion: "Segundo pago - 70% del alquiler",
        fecha_registro: new Date().toISOString().split('T')[0],
        usuario_id: user?.id || null
      };

      await Promise.all([
        pagoService.crearPago(primerPago),
        pagoService.crearPago(segundoPago)
      ]);
      
    } else {
      // Lógica original para otros tipos de espacios
    const fechasPago = calcularFechasPago(fechaInicio, fechaFin);
    
    const promises = fechasPago.map((fecha, i) => {
      const pagoData = {
        contrato_id: parseInt(contratoId),
        monto: parseFloat(montoMensual),
        fecha_pago: fecha.toISOString().split('T')[0],
        metodo_pago: "EFECTIVO",
        tipo_pago: "ALQUILER",
        estado: "PENDIENTE",
        observacion: `Pago automático ${i + 1} de ${fechasPago.length}`,
        fecha_registro: new Date().toISOString().split('T')[0],
        usuario_id: user?.id || null
      };
      
      return pagoService.crearPago(pagoData);
    });
    
    await Promise.all(promises);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let inquilinoId;
      
      // Si ya existe el inquilino, usamos su ID directamente
      if (inquilinoExistente) {
        inquilinoId = inquilinoExistente.id;
      } else {
        // Si no existe, creamos un nuevo inquilino
        //console.log('Creando nuevo inquilino...');
        
        // Crear la persona (inquilino)
        const personaData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          dni: formData.documento,
          direccion: formData.direccion || '',
          rol: 'inquilino'
        };
        
        // Obtener el token usando getAuthToken
        const token = getAuthToken();
        //console.log('Token obtenido:', token);

        if (!token) {
          throw new Error('No hay token de autenticación disponible');
        }
        
        try {
          const personaResponse = await api.post(`${API_URL}/personas`, personaData, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          inquilinoId = personaResponse.data.id;
          //console.log('Nuevo inquilino creado con ID:', inquilinoId);
        } catch (error) {
          if (error.response?.data?.error?.includes('Duplicate entry') && error.response?.data?.error?.includes('email')) {
            const emailDuplicado = error.response.data.error.match(/'([^']+)'/)[1];
            throw new Error(`El email ${emailDuplicado} ya está registrado en el sistema`);
          } else {
            throw error;
          }
        }
      }
      
      // Actualizar el estado del espacio a ocupado (1)
      try {
        // Datos para actualizar el espacio
        const espacioData = {
          estado: 1 // 1 = Ocupado
        };
        
        // Actualizar el espacio
        await espacioService.actualizarEspacio(
          formData.inmuebleId,
          formData.pisoId, 
          formData.espacioId,
          espacioData
        );
        
        //console.log('Espacio actualizado a estado "Ocupado"');
      } catch (espacioError) {
        console.error('Error al actualizar estado del espacio:', espacioError);
        // No interrumpimos el flujo principal si falla esta actualización
      }

      // Crear el contrato
      const contratoData = {
        inquilino_id: inquilinoId,
        espacio_id: parseInt(formData.espacioId),
        inmueble_id: parseInt(formData.inmuebleId),
        fecha_inicio: formData.fechaInicio,
        fecha_fin: formData.fechaFin,
        monto_alquiler: parseFloat(formData.montoMensual),
        monto_garantia: parseFloat(formData.deposito || 0),
        descripcion: formData.observaciones || '',
        documento: formData.documento,
        estado: 'inactivo',
        fecha_pago: formData.fechaInicio
      };
      
     
      
      // Obtener el token usando getAuthToken
      const token = getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      const contratoResponse = await api.post(`${API_URL}/contratos`, contratoData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      // Generar pagos mensuales automáticamente
      try {
        await generarPagosMensuales(
          contratoResponse.data.id,
          formData.montoMensual,
          formData.fechaInicio,
          formData.fechaFin
        );
      } catch (pagosError) {
        console.error('Error al generar pagos mensuales:', pagosError);
        // No interrumpimos el flujo principal si falla la generación de pagos
      }

      await Swal.fire({
        title: '¡Registro Exitoso!',
        text: inquilinoExistente 
          ? 'Se ha creado un nuevo contrato para el inquilino existente' 
          : 'El inquilino y el contrato han sido registrados correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      navigate('/inquilinos-registros');

    } catch (error) {
      console.error('Error completo:', error);
      console.error('Error response data:', error.response?.data);
      
      // Mostrar el error completo del servidor
      const errorData = error.response?.data || {};
      const errorMessage = error.message || errorData.error || errorData.message || 'Error al crear el inquilino o contrato. Por favor, intente nuevamente.';
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#d33'
      });
      
      setError('Error al crear el inquilino o contrato');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Sidebar id='menu-item3' id1='menu-items3' activeClassName='inquilinos-registrar'/>
        <div className="page-wrapper">
          <div className="content">
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                    <Link to="#">Inquilinos</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <i className="feather-chevron-right">
                      <FiChevronRight />
                      </i>
                    </li>
                  <li className="breadcrumb-item active">Registrar Inquilino</li>
                  </ul>
              </div>
            </div>
          </div>

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                <div className="card-header">
                  <h4 className="mb-0">Registrar Nuevo Inquilino</h4>
                </div>
                  <div className="card-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Primer paso: Datos personales */}
                    {step === 1 && (
                      <div>
                      <div className="row">
                        <div className="col-12">
                          <div className="form-heading">
                            <h4>Datos Personales</h4>
                          </div>
                        </div>

                          <div className="col-12 col-md-6">
                            <div className="form-group local-forms">
                              <label>Tipo de Documento <span className="login-danger">*</span></label>
                              <select
                                className={`form-control ${formErrors.tipoDocumento ? 'is-invalid' : ''}`}
                                name="tipoDocumento"
                                value={formData.tipoDocumento}
                                onChange={handleChange}
                                required
                                disabled={verificandoDocumento || documentoVerificado}
                              >
                                <option value="">Seleccionar</option>
                                <option value="DNI">DNI</option>
                                <option value="RUC">RUC</option>
                                <option value="CE">Carné de Extranjería</option>
                              </select>
                              {formErrors.tipoDocumento && (
                                <div className="invalid-feedback d-block">
                                  {formErrors.tipoDocumento}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div className="form-group local-forms">
                              <label>Documento <span className="login-danger">*</span></label>
                              <div className="input-group">
                                <input
                                  type="text"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  className={`form-control ${formErrors.documento ? 'is-invalid' : ''}`}
                                  name="documento"
                                  value={formData.documento}
                                  onChange={handleChange}
                                  onKeyDown={handleDocumentoKeyDown}
                                  onBlur={handleDocumentoBlur}
                                  required
                                  placeholder="Ingrese el documento y presione Enter para verificar"
                                  disabled={verificandoDocumento}
                                />
                                {verificandoDocumento && (
                                  <button className="btn btn-primary" type="button" disabled>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Verificando...
                                  </button>
                                )}
                                {!verificandoDocumento && formData.documento && (
                                  <button 
                                    className="btn btn-primary" 
                                    type="button" 
                                    onClick={() => verificarDocumento(formData.documento)}
                                  >
                                    Verificar
                                  </button>
                                )}
                              </div>
                              {formErrors.documento && (
                                <div className="invalid-feedback d-block">
                                  {formErrors.documento}
                                </div>
                              )}
                              {documentoVerificado && inquilinoExistente && (
                                <div className="mt-2 alert alert-success py-1">
                                  <strong>Inquilino verificado:</strong> {inquilinoExistente.nombre} {inquilinoExistente.apellido}
                                  <p className="mb-0 mt-1"><small>Puede continuar con el registro del contrato.</small></p>
                                </div>
                              )}
                              {documentoVerificado && !inquilinoExistente && formData.documento && (
                                <div className="mt-2 alert alert-info py-1">
                                  <strong>Inquilino nuevo:</strong> Complete los datos para registrar un nuevo inquilino.
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="col-12 col-md-6">
                            <div className="form-group local-forms">
                                <label>Nombre <span className="login-danger">*</span></label>
                                <input
                                  type="text"
                                  className={`form-control ${formErrors.nombre ? 'is-invalid' : ''}`}
                                  name="nombre"
                                  value={formData.nombre}
                                  onChange={handleChange}
                                  required
                                  disabled={verificandoDocumento || inquilinoExistente}
                                />
                                {formErrors.nombre && (
                                  <div className="invalid-feedback d-block">
                                    {formErrors.nombre}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="col-12 col-md-6">
                              <div className="form-group local-forms">
                                <label>Apellido <span className="login-danger">*</span></label>
                                <input
                                  type="text"
                                  className={`form-control ${formErrors.apellido ? 'is-invalid' : ''}`}
                                  name="apellido"
                                  value={formData.apellido}
                                  onChange={handleChange}
                                  required
                                  disabled={verificandoDocumento || inquilinoExistente}
                                />
                                {formErrors.apellido && (
                                  <div className="invalid-feedback d-block">
                                    {formErrors.apellido}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="col-12 col-md-6">
                              <div className="form-group local-forms">
                                <label>Email <span className="login-danger">*</span></label>
                                  <input
                                  type="email"
                                  className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  required
                                  disabled={verificandoDocumento || inquilinoExistente}
                                />
                                {formErrors.email && (
                                  <div className="invalid-feedback d-block">
                                    {formErrors.email}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="col-12 col-md-6">
                              <div className="form-group local-forms">
                                <label>Teléfono <span className="login-danger">*</span></label>
                                <input
                                  type="tel"
                                  pattern="[0-9]*"
                                  inputMode="numeric"
                                  className={`form-control ${formErrors.telefono ? 'is-invalid' : ''}`}
                                  name="telefono"
                                  value={formData.telefono}
                                  onChange={handleChange}
                                  required
                                  placeholder="Ingrese solo números"
                                  disabled={verificandoDocumento || inquilinoExistente}
                                />
                                {formErrors.telefono && (
                                  <div className="invalid-feedback d-block">
                                    {formErrors.telefono}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="col-12 col-md-6">
                              <div className="form-group local-forms">
                                <label>Dirección</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="direccion"
                                  value={formData.direccion}
                                  onChange={handleChange}
                                  disabled={verificandoDocumento || inquilinoExistente}
                                />
                              </div>
                            </div>
                          </div>
                        
                        <div className="text-center mt-4">
                          <button type="button" className="btn btn-primary" onClick={handleNext} disabled={verificandoDocumento}>
                            {verificandoDocumento ? 'Verificando...' : 'Siguiente'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Segundo paso: Datos del contrato */}
                    {step === 2 && (
                      <div>
                        <div className="row">
                        <div className="col-12">
                          <div className="form-heading">
                              <h4>Datos del Contrato</h4>
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div className="form-group local-forms">
                              <label>Inmueble <span className="login-danger">*</span></label>
                              <select
                                className="form-control"
                                name="inmuebleId"
                                value={formData.inmuebleId}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Seleccionar Inmueble</option>
                                {inmuebles.map(inmueble => (
                                  <option key={inmueble.id} value={inmueble.id}>
                                    {inmueble.nombre}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div className="form-group local-forms">
                              <label>Piso <span className="login-danger">*</span></label>
                              <select
                                className="form-control"
                                name="pisoId"
                                value={formData.pisoId}
                                onChange={handleChange}
                                required
                                disabled={!formData.inmuebleId}
                              >
                                <option value="">Seleccionar Piso</option>
                                {pisos.map(piso => (
                                  <option key={piso.id} value={piso.id}>
                                    {piso.nombre}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="col-12 col-md-6">
                          <div className="form-group local-forms">
                              <label>Espacio <span className="login-danger">*</span></label>
                              <select
                                className="form-control"
                                name="espacioId"
                                value={formData.espacioId}
                                onChange={handleChange}
                                required
                                disabled={!formData.pisoId}
                              >
                                <option value="">Seleccionar Espacio</option>
                                {espacios && espacios.length > 0 ? (
                                  espacios
                                    .filter(espacio => espacio.estado === 0 || espacio.estado === '0') // Filtrar solo espacios desocupados
                                    .map(espacio => {
                                      // console.log('Renderizando espacio desocupado:', espacio);
                                      return (
                                        <option key={espacio.id} value={espacio.id}>
                                          {`${espacio.nombre} - ${espacio.tipo_espacio} (S/ ${parseFloat(espacio.precio).toFixed(2)})`}
                                        </option>
                                      );
                                    })
                                ) : (
                                  <option value="" disabled>No hay espacios disponibles</option>
                                )}
                              </select>
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div className="form-group local-forms">
                              <label>Fecha de Inicio <span className="login-danger">*</span></label>
                              <input
                                type="date"
                                className="form-control"
                                name="fechaInicio"
                                value={formData.fechaInicio}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div className="form-group local-forms">
                              <label>Fecha de Fin <span className="login-danger">*</span></label>
                              <input
                                type="date"
                                className="form-control"
                                name="fechaFin"
                                value={formData.fechaFin}
                                onChange={handleChange}
                                required
                                min={formData.fechaInicio || new Date().toISOString().split('T')[0]}
                              />
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                          <div className="form-group local-forms">
                              <label>
                                {espacioSeleccionado.tipo === 'Local' ? 'Monto de alquiler' : 'Monto Mensual'} 
                                <span className="login-danger">*</span>
                              </label>
                              <input
                                type="number"
                              className="form-control"
                                name="montoMensual"
                                value={formData.montoMensual}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                          </div>
                        </div>

                          <div className="col-12 col-md-6">
                            <div className="form-group local-forms">
                              <label>Depósito</label>
                              <input
                                type="number"
                                className="form-control"
                                name="deposito"
                                value={formData.deposito}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="form-group local-forms">
                              <label>Observaciones</label>
                              <textarea
                                className="form-control"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Ingrese observaciones adicionales del contrato"
                              ></textarea>
                            </div>
                          </div>
                        </div>

                        <div className="text-center mt-4">
                          <button type="button" className="btn btn-secondary me-2" onClick={handleBack}>
                            Volver
                            </button>
                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrar Inquilino'}
                            </button>
                        </div>
                      </div>
                    )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default InquilinosRegistrar;
