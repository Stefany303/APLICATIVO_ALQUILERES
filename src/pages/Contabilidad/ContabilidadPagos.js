/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { DatePicker } from "antd";
import { FiChevronRight } from "react-icons/fi";
import Select from "react-select";
import { imagesend } from "../../components/imagepath";
import { Link } from 'react-router-dom';
import espacioService from '../../services/espacioService';
import inmuebleService from '../../services/inmuebleService';
import personaService from '../../services/personaService';

const ContabilidadPagos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    espacioId: '',
    inquilinoId: '',
    monto: '',
    fechaPago: '',
    metodoPago: '',
    estado: '',
    observaciones: ''
  });

  const [espacios, setEspacios] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const metodosPago = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'TARJETA', label: 'Tarjeta de Crédito/Débito' }
  ];

  const estadosPago = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'PAGADO', label: 'Pagado' },
    { value: 'VENCIDO', label: 'Vencido' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener espacios
        const inmuebles = await inmuebleService.obtenerInmuebles();
        const espaciosData = [];
        for (const inmueble of inmuebles) {
          const pisos = inmueble.pisos || [];
          for (const piso of pisos) {
            const espaciosPiso = await espacioService.obtenerEspaciosPorPiso(inmueble.id, piso.id);
            espaciosData.push(...espaciosPiso.map(espacio => ({
              value: espacio.id,
              label: `${inmueble.nombre} - Piso ${piso.numero} - ${espacio.nombre}`
            })));
          }
        }
        setEspacios(espaciosData);

        // Obtener inquilinos
        const personas = await personaService.obtenerPersonas();
        const inquilinosData = personas.map(persona => ({
          value: persona.id,
          label: `${persona.nombre} ${persona.apellido}`
        }));
        setInquilinos(inquilinosData);
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
      fechaPago: dateString
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implementar la llamada a la API para guardar el pago
      console.log('Datos del pago:', formData);
      // Mostrar mensaje de éxito
      alert('Pago registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      alert('Error al registrar el pago');
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
      <Sidebar id='menu-item6' id1='menu-items6' activeClassName='contabilidad-pagos'/>
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
                          <h4>Registrar Pago de Alquiler</h4>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Espacio
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            name="espacioId"
                            options={espacios}
                            onChange={handleSelectChange}
                            styles={customStyles}
                            placeholder="Seleccionar espacio"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Inquilino
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            name="inquilinoId"
                            options={inquilinos}
                            onChange={handleSelectChange}
                            styles={customStyles}
                            placeholder="Seleccionar inquilino"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms cal-icon">
                          <label>
                            Fecha de Pago
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
                            Método de Pago
                            <span className="login-danger">*</span>
                          </label>
                          <Select
                            name="metodoPago"
                            options={metodosPago}
                            onChange={handleSelectChange}
                            styles={customStyles}
                            placeholder="Seleccionar método de pago"
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
                            options={estadosPago}
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
                            Registrar Pago
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary cancel-form"
                            onClick={() => setFormData({
                              espacioId: '',
                              inquilinoId: '',
                              monto: '',
                              fechaPago: '',
                              metodoPago: '',
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
    </>
  );
};

export default ContabilidadPagos;
