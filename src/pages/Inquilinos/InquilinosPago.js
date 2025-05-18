/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { DatePicker, Space } from "antd";
import { FiChevronRight } from "react-icons/fi";
import Select from "react-select";
import { Link, useNavigate } from 'react-router-dom';
import "../../assets/styles/select-components.css";
import inmuebleService from "../../services/inmuebleService";
import espacioService from "../../services/espacioService";
import pisoService from "../../services/pisoService";
import Swal from 'sweetalert2';
import { useAuth } from "../../utils/AuthContext";

const InquilinosPago = () => {
  const { user, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [selectedInmueble, setSelectedInmueble] = useState(null);
  const [selectedPiso, setSelectedPiso] = useState(null);
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [selectedTipoPago, setSelectedTipoPago] = useState(null);
  const [fechaPago, setFechaPago] = useState(null);
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    monto: ''
  });
  const [formErrors, setFormErrors] = useState({
    inmueble: '',
    piso: '',
    espacio: '',
    dni: '',
    nombre: '',
    fechaPago: '',
    tipoPago: '',
    monto: ''
  });

  const tiposPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'paypal', label: 'Paypal' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
    { value: 'yape', label: 'Yape' },
    { value: 'plin', label: 'Plin' }
  ];

  // Cargar inmuebles al montar el componente
  useEffect(() => {
    const cargarInmuebles = async () => {
      try {
        const data = await inmuebleService.obtenerInmuebles();
        if (data && Array.isArray(data)) {
          setInmuebles(data);
        }
      } catch (error) {
        console.error('Error al cargar inmuebles:', error);
      }
    };

    cargarInmuebles();
  }, []);

  // Cargar pisos cuando se selecciona un inmueble
  useEffect(() => {
    const cargarPisos = async () => {
      if (selectedInmueble?.value) {
        try {
          const data = await pisoService.obtenerPorInmueble(selectedInmueble.value);
          if (data && Array.isArray(data)) {
            setPisos(data);
          }
        } catch (error) {
          console.error('Error al cargar pisos:', error);
        }
      } else {
        setPisos([]);
        setEspacios([]);
      }
    };

    cargarPisos();
  }, [selectedInmueble]);

  // Cargar espacios cuando se selecciona un piso
  useEffect(() => {
    const cargarEspacios = async () => {
      if (selectedPiso?.value) {
        try {
          const data = await espacioService.obtenerPorPiso(selectedPiso.value);
          if (data && Array.isArray(data)) {
            setEspacios(data);
          }
        } catch (error) {
          console.error('Error al cargar espacios:', error);
        }
      } else {
        setEspacios([]);
      }
    };

    cargarEspacios();
  }, [selectedPiso]);

  const handleInmuebleChange = (selected) => {
    setSelectedInmueble(selected);
    setSelectedPiso(null);
    setSelectedEspacio(null);
    // Limpiar error del inmueble
    setFormErrors(prev => ({
      ...prev,
      inmueble: ''
    }));
  };

  const handlePisoChange = (selected) => {
    setSelectedPiso(selected);
    setSelectedEspacio(null);
    // Limpiar error del piso
    setFormErrors(prev => ({
      ...prev,
      piso: ''
    }));
  };

  const handleEspacioChange = (selected) => {
    setSelectedEspacio(selected);
    // Limpiar error del espacio
    setFormErrors(prev => ({
      ...prev,
      espacio: ''
    }));
  };

  const handleTipoPagoChange = (selected) => {
    setSelectedTipoPago(selected);
    // Limpiar error del tipo de pago
    setFormErrors(prev => ({
      ...prev,
      tipoPago: ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!selectedInmueble) {
      errors.inmueble = 'Debe seleccionar un inmueble';
      isValid = false;
    }
    if (!selectedPiso) {
      errors.piso = 'Debe seleccionar un piso';
      isValid = false;
    }
    if (!selectedEspacio) {
      errors.espacio = 'Debe seleccionar un espacio';
      isValid = false;
    }
    if (!formData.dni.trim()) {
      errors.dni = 'El DNI es requerido';
      isValid = false;
    }
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
      isValid = false;
    }
    if (!fechaPago) {
      errors.fechaPago = 'La fecha de pago es requerida';
      isValid = false;
    }
    if (!selectedTipoPago) {
      errors.tipoPago = 'Debe seleccionar un tipo de pago';
      isValid = false;
    }
    if (!formData.monto.trim()) {
      errors.monto = 'El monto es requerido';
      isValid = false;
    } else if (isNaN(formData.monto) || parseFloat(formData.monto) <= 0) {
      errors.monto = 'El monto debe ser un número válido mayor a 0';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!estaAutenticado) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay sesión activa'
      });
      return;
    }

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor complete todos los campos requeridos correctamente'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Aquí iría la llamada al servicio para guardar el pago
      // await pagoService.registrarPago({...});

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El pago se ha registrado correctamente',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        navigate('/inquilinos');
      });
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al registrar el pago'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Los datos ingresados se perderán",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/inquilinos-registros');
      }
    });
  };

  const handleDateChange = (date, dateString) => {
    setFechaPago(date);
    // Limpiar error de la fecha
    setFormErrors(prev => ({
      ...prev,
      fechaPago: ''
    }));
  };

  return (
    <>
      <Header />
      <Sidebar id='menu-item' id1='menu-items' activeClassName='inquilinos-pago'/>
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
                  <li className="breadcrumb-item active">Registrar Pago</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12">
                        <div className="form-heading">
                          <h4>Registrar pago de un inquilino</h4>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Inmueble
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            classNamePrefix="select"
                            options={inmuebles.map(i => ({ value: i.id, label: i.nombre }))}
                            value={selectedInmueble}
                            onChange={handleInmuebleChange}
                            placeholder="Selecciona un inmueble"
                            isClearable
                          />
                          {formErrors.inmueble && (
                            <div className="invalid-feedback d-block">{formErrors.inmueble}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Piso
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            classNamePrefix="select"
                            options={pisos.map(p => ({ value: p.id, label: p.nombre }))}
                            value={selectedPiso}
                            onChange={handlePisoChange}
                            placeholder="Selecciona un piso"
                            isClearable
                            isDisabled={!selectedInmueble}
                          />
                          {formErrors.piso && (
                            <div className="invalid-feedback d-block">{formErrors.piso}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Espacio
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            classNamePrefix="select"
                            options={espacios.map(e => ({ 
                              value: e.id, 
                              label: `${e.nombre} - ${e.tipo_espacio} (S/ ${parseFloat(e.precio).toFixed(2)})` 
                            }))}
                            value={selectedEspacio}
                            onChange={handleEspacioChange}
                            placeholder="Selecciona un espacio"
                            isClearable
                            isDisabled={!selectedPiso}
                          />
                          {formErrors.espacio && (
                            <div className="invalid-feedback d-block">{formErrors.espacio}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Dni del inquilino
                            <span className="login-danger">*</span>
                          </label>
                          <input 
                            className={`form-control ${formErrors.dni ? 'is-invalid' : ''}`}
                            type="text"
                            name="dni"
                            value={formData.dni}
                            onChange={handleInputChange}
                          />
                          {formErrors.dni && (
                            <div className="invalid-feedback">{formErrors.dni}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Nombre del inquilino
                            <span className="login-danger">*</span>
                          </label>
                          <input 
                            className={`form-control ${formErrors.nombre ? 'is-invalid' : ''}`}
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                          />
                          {formErrors.nombre && (
                            <div className="invalid-feedback">{formErrors.nombre}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms cal-icon">
                          <label>
                            Fecha de Pago
                            <span className="login-danger">*</span>
                          </label>
                          <DatePicker
                            className={`form-control datetimepicker ${formErrors.fechaPago ? 'is-invalid' : ''}`}
                            onChange={handleDateChange}
                            suffixIcon={null}
                            placeholder="Selecciona la fecha"
                          />
                          {formErrors.fechaPago && (
                            <div className="invalid-feedback d-block">{formErrors.fechaPago}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Tipo de Pago
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            classNamePrefix="select"
                            options={tiposPago}
                            value={selectedTipoPago}
                            onChange={handleTipoPagoChange}
                            placeholder="Selecciona el tipo de pago"
                            isClearable
                          />
                          {formErrors.tipoPago && (
                            <div className="invalid-feedback d-block">{formErrors.tipoPago}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Monto pagado
                            <span className="login-danger">*</span>
                          </label>
                          <input 
                            className={`form-control ${formErrors.monto ? 'is-invalid' : ''}`}
                            type="text"
                            name="monto"
                            value={formData.monto}
                            onChange={handleInputChange}
                          />
                          {formErrors.monto && (
                            <div className="invalid-feedback">{formErrors.monto}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="doctor-submit text-end">
                          <button
                            type="submit"
                            className="btn btn-primary submit-form me-2"
                            disabled={loading}
                          >
                            {loading ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary cancel-form"
                            onClick={handleCancel}
                            disabled={loading}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
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

export default InquilinosPago;
