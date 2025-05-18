import React, { useState, useEffect, useCallback } from 'react';
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import inmuebleService from "../../services/inmuebleService";
import espacioService from "../../services/espacioService";
import pisoService from "../../services/pisoService";
import tipoespacioService from "../../services/tipoespacioService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from "sweetalert2";
import '../../assets/styles/form-styles.css';
import '../../assets/styles/table-styles.css';
import '../../assets/styles/EspaciosRegistrar.css';
import Select from 'react-select';
import "../../assets/styles/select-components.css";

const INITIAL_FORM_STATE = {
  inmueble_id: '',
  piso_id: '',
  nombre: '',
  tipoEspacio_id: '',
  descripcion: '',
  precio: '',
  capacidad: '',
  bano: '',
  estado: '0'
};

const EspaciosRegistrar = () => {
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tipoEspacios, setTipoEspacios] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});

  // Validación del formulario
  // const validateForm = () => {
  //   const errors = [];
  //   if (!formData.inmueble_id) errors.push('Debe seleccionar un inmueble');
  //   if (!formData.piso_id) errors.push('Debe seleccionar un piso');
  //   if (!formData.nombre?.trim()) errors.push('El nombre es requerido');
  //   if (!formData.tipoEspacio) errors.push('Debe seleccionar un tipo de espacio');
  //   if (!formData.descripcion?.trim()) errors.push('La descripción es requerida');
  //   if (!formData.precio || formData.precio <= 0) errors.push('El precio debe ser mayor a 0');
  //   if (!formData.capacidad || formData.capacidad < 1) errors.push('La capacidad debe ser al menos 1');
  //   if (!formData.bano) errors.push('Debe seleccionar el tipo de baño');
  //   return errors;
  // };

  const validateField = (name, value) => {
    switch (name) {
      case "inmueble_id":
        return value ? "" : "El inmueble es requerido";
      case "piso_id":
        return value ? "" : "El piso es requerido";
      case "nombre":
        return value ? "" : "El nombre es requerido";
      case "tipoEspacio_id":
        return value ? "" : "El tipo de espacio es requerido";
      case "precio":
        return value && !isNaN(value) && Number(value) > 0
          ? ""
          : "El precio debe ser mayor a 0";
      case "capacidad":
        return value && !isNaN(value) && Number(value) >= 1
          ? ""
          : "La capacidad debe ser al menos 1";
      case "descripcion":
        return value ? "" : "La descripción es requerida";
      case "bano":
        return value ? "" : "Debe seleccionar el tipo de baño";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Cargar datos iniciales
  const fetchInitialData = useCallback(async () => {
    try {
      const [inmuebleData, espacioData] = await Promise.all([
        inmuebleService.obtenerInmuebles(),
        tipoespacioService.obtenerTodos()
      ]);
      setInmuebles(inmuebleData);
      setTipoEspacios(espacioData);
    } catch (error) {
      handleError(error, 'Error al cargar los datos iniciales');
    }
  }, []);

  useEffect(() => {
    if (!estaAutenticado) {
      navigate("/login");
      return;
    }
    fetchInitialData();
  }, [estaAutenticado, navigate, fetchInitialData]);

  // Manejo de errores centralizado
  const handleError = (error, message = 'Ha ocurrido un error') => {
    console.error(message, error);
    const errorMessage = error.response?.data?.message || error.message || message;
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "inmueble_id") {
      setFormData(prev => ({ ...prev, piso_id: '' })); // Reset piso when inmueble changes
      try {
        const pisos = await pisoService.obtenerPorInmueble(value);
        setPisos(pisos);
      } catch (error) {
        handleError(error, 'Error al obtener los pisos');
      }
    }
  };

  const handleSelectChange = (selected, name) => {
    setFormData((prev) => ({ ...prev, [name]: selected ? selected.value : "" }));

    const error = validateField(name, selected ? selected.value : "");
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor corrija los errores antes de continuar",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      setLoading(false);
      return;
    }

    try {
      const espacioData = {
        inmueble_id: formData.inmueble_id,
        piso_id: formData.piso_id,
        nombre: formData.nombre.trim(),
        tipoEspacio_id: formData.tipoEspacio_id,
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        capacidad: parseInt(formData.capacidad),
        bano: formData.bano === 'propio',
        estado: 0
      };

      console.log("Datos a enviar:", JSON.stringify(espacioData));

      const espacioCreado = await espacioService.crearEspacio(espacioData);
      
      if (espacioCreado) {
        Swal.fire({
          title: "¡Éxito!",
          text: "El espacio ha sido registrado correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          navigate("/espacios-registros");
        });
      }
    } catch (error) {
      console.error("Error al añadir el espacio:", error);
      Swal.fire({
        title: "Error",
        text: "Error al añadir el espacio. Inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Los datos no guardados se perderán",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, continuar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/espacios-registros");
      }
    });
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Sidebar id='menu-item2' id1='menu-item2' activeClassName='espacios-registrar'/>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/espacios">Espacios</Link></li>
                  <li className="breadcrumb-item"><FiChevronRight /></li>
                  <li className="breadcrumb-item active">Registrar</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row">
                      <div className="col-12">
                        <h4 className="mb-4">Detalles del Espacio</h4>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="inmueble_id">Inmueble *</label>
                          <Select
                            classNamePrefix="select"
                            options={inmuebles.map(i => ({ value: i.id, label: i.nombre }))}
                            value={inmuebles.find(i => i.id === formData.inmueble_id) ? 
                              { value: formData.inmueble_id, label: inmuebles.find(i => i.id === formData.inmueble_id).nombre } : 
                              null}
                            onChange={(selected) => {
                              handleChange({ target: { name: 'inmueble_id', value: selected?.value } });
                              handleSelectChange(selected, 'inmueble_id');
                            }}
                            placeholder="Seleccione un inmueble"
                          />
                          {formErrors.inmueble_id && (
                            <div className="invalid-feedback">{formErrors.inmueble_id}</div>
                          )}
                          <small id="inmuebleHelp" className="form-text text-muted">
                            Seleccione el inmueble donde se encuentra el espacio
                          </small>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="piso_id">Piso *</label>
                          <Select
                            classNamePrefix="select"
                            options={pisos.map(p => ({ value: p.id, label: p.nombre }))}
                            value={pisos.find(p => p.id === formData.piso_id) ? 
                              { value: formData.piso_id, label: pisos.find(p => p.id === formData.piso_id).nombre } : 
                              null}
                            onChange={(selected) => {
                              handleChange({ target: { name: 'piso_id', value: selected?.value } });
                              handleSelectChange(selected, 'piso_id');
                            }}
                            placeholder="Seleccione un piso"
                          />
                          {formErrors.piso_id && (
                            <div className="invalid-feedback">{formErrors.piso_id}</div>
                          )}
                          <small id="pisoHelp" className="form-text text-muted">
                            {!formData.inmueble_id ? 'Primero seleccione un inmueble' : 'Seleccione el piso del espacio'}
                          </small>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="tipoEspacio_id">Tipo de Espacio *</label>
                          <Select
                            classNamePrefix="select"
                            options={tipoEspacios.map(t => ({ value: t.id, label: t.nombre }))}
                            value={tipoEspacios.find(t => t.id === formData.tipoEspacio_id) ? 
                              { value: formData.tipoEspacio_id, label: tipoEspacios.find(t => t.id === formData.tipoEspacio_id).nombre } : 
                              null}
                            onChange={(selected) => {
                              handleChange({ target: { name: 'tipoEspacio_id', value: selected?.value } });
                              handleSelectChange(selected, 'tipoEspacio_id');
                            }}
                            placeholder="Seleccione un tipo de espacio"
                          />
                          {formErrors.tipoEspacio_id && (
                            <div className="invalid-feedback">{formErrors.tipoEspacio_id}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="nombre">Nombre *</label>
                          <input
                            id="nombre"
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className={`form-control ${formErrors.nombre ? 'is-invalid' : ''}`}
                            placeholder="Ingrese el nombre del espacio"
                            maxLength={100}
                          />
                          {formErrors.nombre && (
                            <div className="invalid-feedback">{formErrors.nombre}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-group local-forms">  
                          <label htmlFor="descripcion">Descripción *</label>
                          <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                            className={`form-control ${formErrors.descripcion ? 'is-invalid' : ''}`}
                            rows={3}
                            placeholder="Describa las características del espacio"
                            maxLength={500}
                          />
                          {formErrors.descripcion && (
                            <div className="invalid-feedback">{formErrors.descripcion}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="precio">Precio *</label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                              id="precio"
                              type="number"
                              name="precio"
                              value={formData.precio}
                              onChange={handleChange}
                              required
                              min="0"
                              step="0.01"
                              className={`form-control ${formErrors.precio ? 'is-invalid' : ''}`}
                              placeholder="0.00"
                            />
                            {formErrors.precio && (
                              <div className="invalid-feedback">{formErrors.precio}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="capacidad">Capacidad *</label>
                          <input
                            id="capacidad"
                            type="number"
                            name="capacidad"
                            value={formData.capacidad}
                            onChange={handleChange}
                            required
                            min="1"
                            className={`form-control ${formErrors.capacidad ? 'is-invalid' : ''}`}
                            placeholder="Número de personas"
                          />
                          {formErrors.capacidad && (
                            <div className="invalid-feedback">{formErrors.capacidad}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="bano">Baño *</label>
                          <Select
                            classNamePrefix="select"
                            options={[
                              { value: 'propio', label: 'Propio' }, 
                              { value: 'compartido', label: 'Compartido' }
                            ]}
                            value={formData.bano ? 
                              { value: formData.bano, label: formData.bano === 'propio' ? 'Propio' : 'Compartido' } : 
                              null}
                            onChange={(selected) => {
                              handleChange({ target: { name: 'bano', value: selected?.value } });
                              handleSelectChange(selected, 'bano');
                            }}
                            placeholder="Seleccione si tiene baño"
                          />
                          {formErrors.bano && (
                            <div className="invalid-feedback">{formErrors.bano}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="estado">Estado *</label>
                          <input
                            type="text"
                            className="form-control"
                            value="Disponible"
                            disabled
                          />
                          <input 
                            type="hidden" 
                            name="estado" 
                            value="0" 
                          />
                          <small className="form-text text-muted">
                            Los espacios nuevos siempre se crean como disponibles
                          </small>
                        </div>
                      </div>

                      <div className="col-12 text-end mt-4">
                        <button 
                          type="button" 
                          className="btn btn-secondary me-2" 
                          onClick={handleCancel}
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Registrando...
                            </>
                          ) : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default EspaciosRegistrar;
