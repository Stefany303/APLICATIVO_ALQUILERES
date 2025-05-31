import React, { useState } from 'react';
import '../../assets/styles/form-styles.css'; // Asegúrate de que la ruta sea correcta
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar"; 
import CrearUsuarioSistemaModal from './CrearUsuarioSistema';
import { Form, Input, Button, Checkbox, message } from "antd";
import personaService from '../../services/personaService';
import Swal from "sweetalert2";

const PersonaRegistrar = () => {
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    rol: '', // Valor por defecto
  });

  const [formErrors, setFormErrors] = useState({});
  const [createAccount, setCreateAccount] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "dni":
        return value && value.length >= 8 ? "" : "El DNI debe tener al menos 8 caracteres";
      case "nombre":
        return value ? "" : "El nombre es requerido";
      case "apellido":
        return value ? "" : "El apellido es requerido";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "El email no es válido";
      case "telefono":
        return value && value.length >= 9 ? "" : "El teléfono debe tener al menos 9 dígitos";
      case "direccion":
        return value ? "" : "La dirección es requerida";
      case "rol":
        return value ? "" : "El rol es requerido";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar el campo cuando cambia
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor corrija los errores antes de continuar",
        icon: "warning",
        confirmButtonText: "Aceptar"
      });
      return;
    }

    try {
      await personaService.crearPersona(formData);
      Swal.fire({
        title: "¡Éxito!",
        text: "La persona ha sido registrada correctamente",
        icon: "success",
        confirmButtonText: "Aceptar"
      }).then(() => {
        // Limpiar el formulario después de un registro exitoso
        setFormData({
          dni: '',
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          direccion: '',
          rol: '',
        });
        setCreateAccount(false);
      });
    } catch (error) {
      console.error('Error registrando persona:', error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.mensaje || "Error al registrar la persona",
        icon: "error",
        confirmButtonText: "Aceptar"
      });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Los datos no guardados se perderán",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, limpiar",
      cancelButtonText: "No, continuar"
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData({
          dni: '',
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          direccion: '',
          rol: '',
        });
        setCreateAccount(false);
        setFormErrors({});
        Swal.fire({
          title: "Formulario limpiado",
          text: "Los datos han sido limpiados correctamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const [openModal, setOpenModal] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(false);

  const handleCheckboxChange = () => {
    setEnableRegistration(!enableRegistration);
    if (!enableRegistration) {
      setOpenModal(true); // Abre el modal cuando se activa el checkbox
    }
  };

  return (
    <div>
      <Header />
      <Sidebar id="menu-item7" id1="menu-items7" activeClassName="persona-registrar" />
      <>
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="#">Persona</Link>
                </li>
                <li className="breadcrumb-item">
                  <i className="feather-chevron-right">
                    <FaChevronRight />
                  </i>
                </li>
                <li className="breadcrumb-item active">Registrar</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}

        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="row">
                    <div className="col-12">
                      <div className="form-heading">
                        <h4>Registro de Información de la Persona</h4>
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>DNI <span className="login-danger">*</span></label>
                        <input
                          className={`form-control ${formErrors.dni ? "is-invalid" : ""}`}
                          name="dni"
                          value={formData.dni}
                          onChange={handleChange}
                          type="text"
                          required
                        />
                        {formErrors.dni && (
                          <div className="invalid-feedback">{formErrors.dni}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Nombre <span className="login-danger">*</span></label>
                        <input
                          className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          type="text"
                          required
                        />
                        {formErrors.nombre && (
                          <div className="invalid-feedback">{formErrors.nombre}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Apellidos <span className="login-danger">*</span></label>
                        <input
                          className={`form-control ${formErrors.apellido ? "is-invalid" : ""}`}
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          type="text"
                          required
                        />
                        {formErrors.apellido && (
                          <div className="invalid-feedback">{formErrors.apellido}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Email <span className="login-danger">*</span></label>
                        <input
                          className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          type="email"
                          required
                        />
                        {formErrors.email && (
                          <div className="invalid-feedback">{formErrors.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Teléfono <span className="login-danger">*</span></label>
                        <input
                          className={`form-control ${formErrors.telefono ? "is-invalid" : ""}`}
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          type="text"
                          required
                        />
                        {formErrors.telefono && (
                          <div className="invalid-feedback">{formErrors.telefono}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Dirección <span className="login-danger">*</span></label>
                        <input
                          className={`form-control ${formErrors.direccion ? "is-invalid" : ""}`}
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          type="text"
                          required
                        />
                        {formErrors.direccion && (
                          <div className="invalid-feedback">{formErrors.direccion}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6 col-xl-3">
                      <div className="form-group local-forms">
                        <label>Rol <span className="login-danger">*</span></label>
                        <select
                          className={`form-control ${formErrors.rol ? "is-invalid" : ""}`}
                          name="rol"
                          value={formData.rol}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Seleccione un rol</option>
                          <option value="propietario">Propietario</option>
                          <option value="inquilino">Inquilino</option>
                          <option value="administrador">Administrador</option>
                        </select>
                        {formErrors.rol && (
                          <div className="invalid-feedback">{formErrors.rol}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-6">
                      <Form layout="vertical">
                        <Form.Item>
                          <Checkbox
                            checked={createAccount}
                            onChange={() => setCreateAccount(!createAccount)}
                          >
                            Crear cuenta de usuario
                          </Checkbox>
                        </Form.Item>
                      </Form>
                    </div>

                    {createAccount && (
                      <>
                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-forms">
                            <label>Usuario</label>
                            <input className="form-control" type="text" />
                          </div>
                        </div>
                        
                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-forms">
                            <label>Contraseña <span className="login-danger">*</span></label>
                            <input className="form-control" type="password" required />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="col-12">
                      <div className="doctor-submit text-end">
                        <button
                          type="submit"
                          className="btn btn-primary submit-form me-2"
                        >
                          Guardar Información
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary cancel-form"
                          onClick={handleCancel}
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
    </div>
  );
};

export default PersonaRegistrar;
