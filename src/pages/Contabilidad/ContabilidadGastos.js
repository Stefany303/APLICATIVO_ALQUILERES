/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { DatePicker } from "antd";
import { FiChevronRight } from "react-icons/fi";
import Select from "react-select";
import { imagesend } from "../../components/imagepath";
import { Link } from 'react-router-dom';
import inmuebleService from '../../services/inmuebleService';

const ContabilidadGastos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    inmuebleId: '',
    concepto: '',
    monto: '',
    fechaGasto: '',
    categoria: '',
    estado: '',
    observaciones: ''
  });

  const [inmuebles, setInmuebles] = useState([]);

  const categoriasGasto = [
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
    { value: 'SERVICIOS', label: 'Servicios Públicos' },
    { value: 'REPARACIONES', label: 'Reparaciones' },
    { value: 'LIMPIEZA', label: 'Limpieza' },
    { value: 'SEGURIDAD', label: 'Seguridad' },
    { value: 'ADMINISTRATIVO', label: 'Gastos Administrativos' },
    { value: 'OTROS', label: 'Otros' }
  ];

  const estadosGasto = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'PAGADO', label: 'Pagado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        setInmuebles(inmueblesData.map(inmueble => ({
          value: inmueble.id,
          label: inmueble.nombre
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (selected, action) => {
    setFormData(prev => ({
      ...prev,
      [action.name]: selected.value
    }));
  };

  const handleDateChange = (date, dateString) => {
    setFormData(prev => ({
      ...prev,
      fechaGasto: dateString
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implementar la llamada a la API para guardar el gasto
      console.log('Datos del gasto:', formData);
      // Mostrar mensaje de éxito
      alert('Gasto registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar el gasto:', error);
      alert('Error al registrar el gasto');
    }
  };

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#2e37a4" : "rgba(46, 55, 164, 0.1)",
      boxShadow: state.isFocused ? "0 0 0 1px #2e37a4" : "none",
      "&:hover": {
        borderColor: "#2e37a4",
      },
      borderRadius: "10px",
      fontSize: "14px",
      minHeight: "45px",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      transform: state.selectProps.menuIsOpen ? "rotate(-180deg)" : "rotate(0)",
      transition: "250ms",
      width: "35px",
      height: "35px",
    }),
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

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Sidebar id='menu-item6' id1='menu-items6' activeClassName='contabilidad-gastos'/>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Contabilidad</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FiChevronRight icon="chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Registrar Gasto</li>
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
                          <h4>Registrar Gasto del Inmueble</h4>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Inmueble
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            name="inmuebleId"
                            options={inmuebles}
                            onChange={handleSelectChange}
                            styles={customStyles}
                            placeholder="Seleccionar inmueble"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Concepto
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="concepto"
                            value={formData.concepto}
                            onChange={handleChange}
                            placeholder="Ingrese el concepto del gasto"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms cal-icon">
                          <label>
                            Fecha del Gasto
                            <span className="login-danger">*</span>
                          </label>
                          <DatePicker
                            className="form-control datetimepicker"
                            onChange={handleDateChange}
                            format="DD/MM/YYYY"
                            placeholder="Seleccionar fecha"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Monto
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            name="monto"
                            value={formData.monto}
                            onChange={handleChange}
                            placeholder="Ingrese el monto"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Categoría
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            name="categoria"
                            options={categoriasGasto}
                            onChange={handleSelectChange}
                            styles={customStyles}
                            placeholder="Seleccionar categoría"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Estado
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            name="estado"
                            options={estadosGasto}
                            onChange={handleSelectChange}
                            styles={customStyles}
                            placeholder="Seleccionar estado"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-sm-12">
                        <div className="form-group local-forms">
                          <label>
                            Observaciones
                          </label>
                          <textarea
                            className="form-control"
                            rows={3}
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            placeholder="Ingrese observaciones adicionales"
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="doctor-submit text-end">
                          <button
                            type="submit"
                            className="btn btn-primary submit-form me-2"
                          >
                            Registrar Gasto
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary cancel-form"
                            onClick={() => setFormData({
                              inmuebleId: '',
                              concepto: '',
                              monto: '',
                              fechaGasto: '',
                              categoria: '',
                              estado: '',
                              observaciones: ''
                            })}
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
      <div
        id="delete_patient"
        className="modal fade delete-modal"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <img src={imagesend}alt width={50} height={46} />
              <h3>Está seguro de eliminar ?</h3>
              <div className="m-t-20">
                <Link
                  to="#"
                  className="btn btn-white me-2"
                  data-bs-dismiss="modal"
                >
                  Close
                </Link>
                <button type="submit" className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContabilidadGastos;
