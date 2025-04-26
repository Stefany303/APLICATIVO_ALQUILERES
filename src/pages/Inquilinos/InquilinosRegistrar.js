import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from "react-icons/fi";
import { message, notification, Alert, Form } from 'antd';
import inquilinoService from '../../services/inquilinoService';
import inmuebleService from '../../services/inmuebleService';
import contratoService from '../../services/contratoService';
import espacioService from '../../services/espacioService';
import pagoService from '../../services/pagoService';
import { useAuth } from "../../utils/AuthContext";
// Importación correcta de estilos de Ant Design
import 'antd/dist/reset.css'; // Para versiones >= 5.x

// Configurar el mensaje global
message.config({
  top: 100,
  duration: 3,
  maxCount: 3,
});

const InquilinosRegistrar = () => {
  const { user, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  
  // Obtener la fecha actual en formato YYYY-MM-DD para prellenar la fecha de inicio
  const fechaActual = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    documento: '',
    tipoDocumento: 'DNI',
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
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documento: '',
    tipoDocumento: '',
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
          console.log('Cargando espacios para inmueble:', formData.inmuebleId, 'y piso:', formData.pisoId);
          const data = await espacioService.obtenerEspaciosPorPiso(formData.inmuebleId, formData.pisoId);
          console.log('Datos de espacios recibidos:', data);
          
          if (data && Array.isArray(data)) {
            setEspacios(data);
          } else {
            console.log('No se recibieron datos válidos de espacios');
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

  // Agregar log para verificar el estado de espacios
  useEffect(() => {
    console.log('Estado actual de espacios:', espacios);
  }, [espacios]);

  const validateField = (name, value) => {
    switch (name) {
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
      case 'documento':
        if (!value) return 'El documento es requerido';
        if (!/^\d+$/.test(value)) return 'El documento debe contener solo números';
        if (value.length > 20) return 'El documento no puede tener más de 20 dígitos';
        return '';
      case 'tipoDocumento':
        return value ? '' : 'El tipo de documento es requerido';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
    // Validar todos los campos del primer paso
    const camposPrimerPaso = ['nombre', 'apellido', 'email', 'telefono', 'documento', 'tipoDocumento'];
    let hasErrors = false;

    camposPrimerPaso.forEach(campo => {
      const error = validateField(campo, formData[campo]);
      if (error) {
        setFormErrors(prev => ({ ...prev, [campo]: error }));
        hasErrors = true;
      }
    });

    if (hasErrors) {
      message.error('Por favor corrija los errores antes de continuar');
      return;
    }

    console.log('Validaciones pasadas, avanzando al paso 2');
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
    const fechasPago = calcularFechasPago(fechaInicio, fechaFin);
    
    // Crear pagos para cada fecha
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos del segundo paso
      const camposRequeridos = ['inmuebleId', 'pisoId', 'espacioId', 'fechaInicio', 'fechaFin', 'montoMensual'];
      const camposFaltantes = camposRequeridos.filter(campo => !formData[campo]);
      
      if (camposFaltantes.length > 0) {
        const mensajeError = `Por favor complete los siguientes campos: ${camposFaltantes.join(', ')}`;
        setError(mensajeError);
        message.error(mensajeError);
        return;
      }

      // Validar fechas
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaFin = new Date(formData.fechaFin);
      const hoy = new Date();

      if (fechaInicio < hoy) {
        const mensajeError = 'La fecha de inicio no puede ser anterior a hoy';
        setError(mensajeError);
        message.error(mensajeError);
        return;
      }

      if (fechaFin <= fechaInicio) {
        const mensajeError = 'La fecha de fin debe ser posterior a la fecha de inicio';
        setError(mensajeError);
        message.error(mensajeError);
        return;
      }

      // Validar monto mensual
      const montoMensual = parseFloat(formData.montoMensual);
      if (isNaN(montoMensual) || montoMensual <= 0) {
        const mensajeError = 'El monto mensual debe ser mayor a 0';
        setError(mensajeError);
        message.error(mensajeError);
        return;
      }

      // Preparar los datos para enviar
      const inquilinoData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        documento: formData.documento,
        tipoDocumento: formData.tipoDocumento,
        espacioId: formData.espacioId,
        inmuebleId: formData.inmuebleId,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        montoMensual: formData.montoMensual,
        deposito: formData.deposito,
        observaciones: formData.observaciones
      };

      // Crear el inquilino y el contrato
      const resultado = await inquilinoService.crearInquilino(inquilinoData);
      
      // Generar pagos mensuales si se ha creado el contrato
      if (resultado && resultado.contrato && resultado.contrato.id) {
        await generarPagosMensuales(
          resultado.contrato.id,
          montoMensual,
          formData.fechaInicio,
          formData.fechaFin
        );
      }

      message.success('Inquilino registrado exitosamente');
      navigate('/inquilinos-registros');
    } catch (error) {
      console.error('Error al registrar inquilino:', error);
      const mensajeError = error.response?.data?.mensaje || error.message || 'Error al registrar el inquilino';
      setError(mensajeError);
      message.error(mensajeError);
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
      <Sidebar id='menu-item3' id1='menu-items3' activeClassName='inquilinos'/>
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
                    <Alert
                      message="Error de validación"
                      description={error}
                      type="error"
                      showIcon
                      style={{ marginBottom: '20px' }}
                    />
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
                              <label>Nombre <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                className={`form-control ${formErrors.nombre ? 'is-invalid' : ''}`}
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
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
                              />
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div className="form-group local-forms">
                              <label>Documento <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                className={`form-control ${formErrors.documento ? 'is-invalid' : ''}`}
                                name="documento"
                                value={formData.documento}
                                onChange={handleChange}
                                required
                                placeholder="Ingrese solo números"
                              />
                              {formErrors.documento && (
                                <div className="invalid-feedback d-block">
                                  {formErrors.documento}
                                </div>
                              )}
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
                        </div>

                        <div className="text-center mt-4">
                          <button type="button" className="btn btn-primary" onClick={handleNext}>
                            Siguiente
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
                                  espacios.map(espacio => {
                                    console.log('Renderizando espacio:', espacio);
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
                              <label>Monto Mensual <span className="login-danger">*</span></label>
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
