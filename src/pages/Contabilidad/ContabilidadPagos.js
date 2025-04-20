/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { DatePicker } from "antd";
import { FiChevronRight, FiSearch } from "react-icons/fi";
import Select from "react-select";
import { imagesend } from "../../components/imagepath";
import { Link } from 'react-router-dom';
import espacioService from '../../services/espacioService';
import inmuebleService from '../../services/inmuebleService';
import personaService from '../../services/personaService';
import pisoService from '../../services/pisoService';
import pagoService from '../../services/pagoService';

const ContabilidadPagos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    inmueble_id: '',
    piso_id: '',
    espacioId: '',
    inquilinoId: '',
    monto: '',
    fechaPago: '',
    metodoPago: '',
    estado: '',
    observaciones: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('dni'); // 'dni' o 'nombre'
  const [inmuebles, setInmuebles] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [loading2, setLoading2] = useState(false);

  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'paypal', label: 'Paypal' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
    { value: 'yape', label: 'Yape' },
    { value: 'plin', label: 'Plin' },
  ];

  const estadosPago = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'pagado', label: 'Pagado' },
    { value: 'vencido', label: 'Vencido' }
  ];


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener inmuebles para referencia
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        setInmuebles(inmueblesData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const buscarInquilino = async () => {
    if (!searchTerm) {
      alert('Por favor ingrese un término de búsqueda');
      return;
    }

    try {
      setLoading2(true);
      let resultados;
      
      if (searchType === 'dni') {
        resultados = await pagoService.obtenerPagosPorInquilino(searchTerm, null);
      } else {
        resultados = await pagoService.obtenerPagosPorInquilino(null, searchTerm);
      }
      
      setPagos(resultados);
      
      if (resultados.length === 0) {
        alert('No se encontraron pagos para este inquilino');
      }
    } catch (error) {
      console.error('Error al buscar pagos del inquilino:', error);
      alert('Error al buscar los pagos del inquilino');
    } finally {
      setLoading2(false);
    }
  };

  const seleccionarPago = (pago) => {
    setPagoSeleccionado(pago);
    
    setFormData({
      inmueble_id: '',
      espacioId: pago.contrato_id || '',
      inquilinoId: pago.inquilino_id || '',
      monto: pago.monto,
      fechaPago: '',
      metodoPago: pago.metodo_pago,
      estado: pago.estado,
      observaciones: ''
    });
  };

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
    
    if (!pagoSeleccionado) {
      alert('Debe seleccionar un pago primero');
      return;
    }
    
    try {
      // Crear objeto con datos del pago
      const pagoData = {
        contrato_id: pagoSeleccionado.contrato_id,
        inquilino_id: pagoSeleccionado.inquilino_id,
        monto: formData.monto,
        metodo_pago: formData.metodoPago,
        tipo_pago: pagoSeleccionado.tipo_pago || 'alquiler',
        estado: formData.estado,
        fecha_pago: formData.fechaPago,
        observaciones: formData.observaciones
      };
      
      console.log('Datos a enviar:', pagoData);
      
      // Actualizar el pago usando el servicio
      await pagoService.actualizarPago(pagoSeleccionado.id, pagoData);
      
      alert('Pago actualizado exitosamente');
      
      // Reset form and search
      setFormData({
        inmueble_id: '',
        piso_id: '',
        espacioId: '',
        inquilinoId: '',
        monto: '',
        fechaPago: '',
        metodoPago: '',
        estado: '',
        observaciones: ''
      });
      setSearchTerm('');
      setPagos([]);
      setPagoSeleccionado(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el pago');
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
                  <div className="row">
                    <div className="col-12">
                      <div className="form-heading">
                        <h4>Buscar Inquilino</h4>
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-4">
                      <div className="form-group">
                        <label>Buscar por</label>
                        <select 
                          className="form-select"
                          value={searchType}
                          onChange={(e) => setSearchType(e.target.value)}
                        >
                          <option value="dni">DNI</option>
                          <option value="nombre">Nombre</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <div className="form-group">
                        <label>Término de búsqueda</label>
                        <input
                          type="text"
                          className="form-control"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={searchType === 'dni' ? "Ingrese DNI del inquilino" : "Ingrese nombre del inquilino"}
                        />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-2">
                      <div className="form-group">
                        <label>&nbsp;</label>
                        <button 
                          type="button" 
                          className="btn btn-primary w-100"
                          onClick={buscarInquilino}
                          disabled={loading2}
                        >
                          {loading2 ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          ) : (
                            <FiSearch className="me-2" />
                          )}
                          Buscar
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {pagos.length > 0 && (
                    <div className="row mt-4">
                      <div className="col-12">
                        <div className="form-heading">
                          <h4>Pagos Encontrados</h4>
                        </div>
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover">
                            <thead>
                              <tr>
                                <th>Inquilino</th>
                                <th>DNI</th>
                                <th>Monto</th>
                                <th>Fecha de Pago</th>
                                <th>Método de Pago</th>
                                <th>Estado</th>
                                <th>Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pagos.map((pago, index) => (
                                <tr key={index}>
                                  <td>{`${pago.inquilino_nombre} ${pago.inquilino_apellido}`}</td>
                                  <td>{pago.inquilino_dni}</td>
                                  <td>{pago.monto}</td>
                                  <td>{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                                  <td>{pago.metodo_pago}</td>
                                  <td>{pago.estado}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      onClick={() => seleccionarPago(pago)}
                                    >
                                      Seleccionar
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {pagoSeleccionado && (
                    <form onSubmit={handleSubmit}>
                      <div className="row mt-4">
                        <div className="col-12">
                          <div className="form-heading">
                            <h4>Editar Pago de Alquiler</h4>
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="form-group local-forms">
                            <label>Inquilino</label>
                            <input
                              type="text"
                              className="form-control"
                              readOnly
                              value={`${pagoSeleccionado.inquilino_nombre} ${pagoSeleccionado.inquilino_apellido}`}
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="form-group local-forms">
                            <label>DNI</label>
                            <input
                              type="text"
                              className="form-control"
                              readOnly
                              value={pagoSeleccionado.inquilino_dni}
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="form-group local-forms">
                            <label>Monto <span className="login-danger">*</span></label>
                            <input
                              type="text"
                              className="form-control"
                              name="monto"
                              value={formData.monto}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="form-group local-forms">
                            <label>Fecha de Pago <span className="login-danger">*</span></label>
                            <DatePicker
                              className="form-control datetimepicker"
                              placeholder="DD-MM-YYYY"
                              onChange={handleDateChange}
                              format="DD-MM-YYYY"
                              style={{ borderColor: "rgba(46, 55, 164, 0.1)" }}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="form-group local-forms">
                            <label>Método de Pago <span className="login-danger">*</span></label>
                            <Select
                              name="metodoPago"
                              options={metodosPago}
                              onChange={handleSelectChange}
                              styles={customStyles}
                              placeholder="Seleccionar método de pago"
                              required
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="form-group local-forms">
                            <label>Estado <span className="login-danger">*</span></label>
                            <Select
                              name="estado"
                              options={estadosPago}
                              onChange={handleSelectChange}
                              styles={customStyles}
                              placeholder="Seleccionar estado"
                              required
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
                            ></textarea>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="doctor-submit text-end">
                            <button type="submit" className="btn btn-primary submit-form me-2">
                              Actualizar Pago
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary cancel-form"
                              onClick={() => {
                                setFormData({
                                  inmueble_id: '',
                                  piso_id: '',
                                  espacioId: '',
                                  inquilinoId: '',
                                  monto: '',
                                  fechaPago: '',
                                  metodoPago: '',
                                  estado: '',
                                  observaciones: ''
                                });
                                setPagoSeleccionado(null);
                                setPagos([]);
                                setSearchTerm('');
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
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