import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { notification } from "antd";
import Select from "react-select";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import "../../assets/styles/Style.css";
import { useAuth } from "../../utils/AuthContext";
import inmuebleService from "../../services/inmuebleService";
import personaService from "../../services/personaService";
import tipoInmuebleService from "../../services/tipoInmuebleService";
import Swal from "sweetalert2";

const AnadirInmueble = () => {
  const { user, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    propietario_id: "",
    tipoInmueble_id: "",
    nombre: "",
    descripcion: "",
    direccion: "",
    ubigeo: "",
    cantidad_pisos: "",
  });

  const [propietarios, setPropietarios] = useState([]);
  const [tiposInmueble, setTiposInmueble] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!estaAutenticado) {
      navigate("/login");
    }

    const fetchData = async () => {
      try {
        const personas = await personaService.obtenerPersonas();
        const propietariosFiltrados = personas.filter(
          (persona) => persona.rol === "propietario"
        );
        setPropietarios(propietariosFiltrados);

        const tiposInmuebleData = await tipoInmuebleService.obtenertipoInmueble();
        setTiposInmueble(tiposInmuebleData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [estaAutenticado, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case "propietario_id":
        return value ? "" : "El propietario es requerido";
      case "tipoInmueble_id":
        return value ? "" : "El tipo de inmueble es requerido";
      case "nombre":
        return value ? "" : "El nombre es requerido";
      case "direccion":
        return value ? "" : "La dirección es requerida";
      case "descripcion":
        return value ? "" : "La descripción es requerida";
      case "ubigeo":
        return value ? "" : "El ubigeo es requerido";
      case "cantidad_pisos":
        return value && !isNaN(value) && Number(value) > 0
          ? ""
          : "La cantidad de pisos debe ser un número mayor que 0";
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
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validar solo ese campo en particular al cambiar
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSelectChange = (selected, name) => {
    setFormData((prev) => ({ ...prev, [name]: selected ? selected.value : "" }));

    const error = validateField(name, selected ? selected.value : "");
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor corrija los errores antes de continuar",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    try {
      const response = await inmuebleService.crearInmueble(formData);

      if (response) {
        Swal.fire({
          title: "¡Éxito!",
          text: "El inmueble ha sido registrado correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          navigate("/inmueble-registros");
        });
      }
    } catch (error) {
      console.error("Error al añadir el inmueble:", error);
      Swal.fire({
        title: "Error",
        text: "Error al añadir el inmueble. Inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
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
        navigate("/inmueble-registros");
      }
    });
  };

  return (
    <div>
      <Header />
      <Sidebar id="menu-item1" id1="menu-items1" activeClassName="inmueble-anadir" />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Inmueble </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FaChevronRight />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Añadir</li>
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
                          <h4>Detalles del Inmueble</h4>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Nombre del Inmueble <span className="login-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${formErrors.nombre ? "is-invalid" : ""}`}
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                          />
                          {formErrors.nombre && (
                            <div className="invalid-feedback">{formErrors.nombre}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Descripción <span className="login-danger">*</span>
                          </label>
                          <textarea
                            className={`form-control ${formErrors.descripcion ? "is-invalid" : ""}`}
                            rows={2}
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                          />
                          {formErrors.descripcion && (
                            <div className="invalid-feedback">{formErrors.descripcion}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Dirección <span className="login-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${formErrors.direccion ? "is-invalid" : ""}`}
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                          />
                          {formErrors.direccion && (
                            <div className="invalid-feedback">{formErrors.direccion}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Ubigeo <span className="login-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${formErrors.ubigeo ? "is-invalid" : ""}`}
                            type="text"
                            name="ubigeo"
                            value={formData.ubigeo}
                            onChange={handleChange}
                            required
                          />
                          {formErrors.ubigeo && (
                            <div className="invalid-feedback">{formErrors.ubigeo}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Cantidad de Pisos <span className="login-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${formErrors.cantidad_pisos ? "is-invalid" : ""}`}
                            type="number"
                            min="1"
                            name="cantidad_pisos"
                            value={formData.cantidad_pisos}
                            onChange={handleChange}
                            required
                          />
                          {formErrors.cantidad_pisos && (
                            <div className="invalid-feedback">{formErrors.cantidad_pisos}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Propietario <span className="login-danger">*</span>
                          </label>
                          <Select
                            options={propietarios.map((p) => ({
                              value: p.id,
                              label: `${p.nombre} ${p.apellido}`,
                            }))}
                            placeholder="Seleccionar propietario"
                            onChange={(selected) => handleSelectChange(selected, "propietario_id")}
                            className={formErrors.propietario_id ? "is-invalid" : ""}
                            value={
                              propietarios
                                .filter((p) => p.id === formData.propietario_id)
                                .map((p) => ({
                                  value: p.id,
                                  label: `${p.nombre} ${p.apellido}`,
                                }))[0] || null
                            }
                            isClearable
                          />
                          {formErrors.propietario_id && (
                            <div className="invalid-feedback d-block">{formErrors.propietario_id}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Tipo de Inmueble <span className="login-danger">*</span>
                          </label>
                          <Select
                            options={tiposInmueble.map((tipo) => ({
                              value: tipo.id,
                              label: tipo.nombre,
                            }))}
                            placeholder="Seleccionar tipo de inmueble"
                            onChange={(selected) => handleSelectChange(selected, "tipoInmueble_id")}
                            className={formErrors.tipoInmueble_id ? "is-invalid" : ""}
                            value={
                              tiposInmueble
                                .filter((tipo) => tipo.id === formData.tipoInmueble_id)
                                .map((tipo) => ({
                                  value: tipo.id,
                                  label: tipo.nombre,
                                }))[0] || null
                            }
                            isClearable
                          />
                          {formErrors.tipoInmueble_id && (
                            <div className="invalid-feedback d-block">{formErrors.tipoInmueble_id}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                        <div className="doctor-submit text-end">
                          <button
                            type="submit"
                            className="btn btn-primary submit-form me-2"
                          >
                            Guardar
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
                    
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnadirInmueble;
