import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import '../../assets/styles/table-styles.css';
import '../../assets/styles/filtros-styles.css';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { blogimg10, imagesend, pdficon, pdficon3, pdficon4, plusicon, refreshicon, searchnormal, blogimg12,
  blogimg2, blogimg4, blogimg6, blogimg8} from '../../components/imagepath';
import { FiChevronRight } from "react-icons/fi";
import {onShowSizeChange,itemRender}from  '../../components/Pagination';
import { Table } from 'antd';
import Select from "react-select";
import { DatePicker} from "antd";
import { useAuth } from "../../utils/AuthContext";
import inmuebleService from "../../services/inmuebleService";
import espacioService from "../../services/espacioService";
import pisoService from "../../services/pisoService";
import tipoespacioService from "../../services/tipoespacioService";
import '../../assets/styles/form-styles.css';
import '../../assets/styles/EspaciosRegistrar.css';
import { message, Spin, Alert, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';

const EspaciosRegistros = () => {
  const { user, estaAutenticado, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [espacios, setEspacios] = useState([]);
  const [espaciosFiltrados, setEspaciosFiltrados] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [tipoEspacios, setTipoEspacios] = useState([]);
  const [selectedInmueble, setSelectedInmueble] = useState('');
  const [selectedPiso, setSelectedPiso] = useState('');
  const [selectedTipoEspacio, setSelectedTipoEspacio] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalViewVisible, setModalViewVisible] = useState(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    capacidad: '',
    bano: '',
    tipoEspacio_id: ''
  });
  const navigate = useNavigate();

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onChange = (date, dateString) => {
    // console.log(date, dateString);
  };

  // Verificar autenticación
  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
    }
  }, [estaAutenticado, navigate]);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      if (!estaAutenticado) return;

      setLoading(true);
      setError(null);
      try {
        // Cargar inmuebles
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        setInmuebles(Array.isArray(inmueblesData) ? inmueblesData : []);

        // Cargar tipos de espacio
        const tiposData = await tipoespacioService.obtenerTodos();
        setTipoEspacios(Array.isArray(tiposData) ? tiposData : []);

        // Cargar todos los espacios
        const espaciosData = await espacioService.obtenerEspacios();
        const espaciosArray = Array.isArray(espaciosData) ? espaciosData : [];
        setEspacios(espaciosArray);
        setEspaciosFiltrados(espaciosArray);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError('Error al cargar los datos');
        setEspacios([]);
        setEspaciosFiltrados([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, [estaAutenticado]);

  // Cargar pisos cuando se selecciona un inmueble
  useEffect(() => {
    const cargarPisos = async () => {
      if (!selectedInmueble || !estaAutenticado) {
        setPisos([]);
        return;
      }

      try {
        const pisosData = await pisoService.obtenerPorInmueble(selectedInmueble);
        setPisos(Array.isArray(pisosData) ? pisosData : []);
        setSelectedPiso('');
      } catch (error) {
        console.error('Error al cargar pisos:', error);
        setPisos([]);
      }
    };

    cargarPisos();
  }, [selectedInmueble, estaAutenticado]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...espacios];

    // Filtrar por inmueble
    if (selectedInmueble) {
      filtered = filtered.filter(espacio => espacio.inmueble_id === parseInt(selectedInmueble));
    }

    // Filtrar por piso
    if (selectedPiso) {
      filtered = filtered.filter(espacio => espacio.piso_id === parseInt(selectedPiso));
    }

    // Filtrar por tipo de espacio
    if (selectedTipoEspacio) {
      filtered = filtered.filter(espacio => espacio.tipoEspacio_id === parseInt(selectedTipoEspacio));
    }

    // Filtrar por texto de búsqueda
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(espacio =>
        espacio.nombre.toLowerCase().includes(searchLower) ||
        espacio.descripcion.toLowerCase().includes(searchLower)
      );
    }

    setEspaciosFiltrados(filtered);
  }, [espacios, selectedInmueble, selectedPiso, selectedTipoEspacio, searchText]);

  const handleInmuebleChange = (e) => {
    setSelectedInmueble(e.target.value);
  };

  const handlePisoChange = (e) => {
    setSelectedPiso(e.target.value);
  };

  const handleTipoEspacioChange = (e) => {
    setSelectedTipoEspacio(e.target.value);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleExport = () => {
    // Implementar lógica de exportación
    message.success('Exportación iniciada');
  };

  const handleEdit = (record) => {
    setEspacioSeleccionado(record);
    setFormData({
      nombre: record.nombre,
      descripcion: record.descripcion,
      precio: record.precio,
      capacidad: record.capacidad,
      bano: record.baño,
      tipoEspacio_id: record.tipoEspacio_id
    });
    setModalEditVisible(true);
  };

  const handleDelete = async (record) => {
    if (!estaAutenticado) {
      message.error('No hay sesión activa');
      return;
    }

    try {
      await espacioService.eliminarEspacio(record.inmueble_id, record.piso_id, record.id);
      message.success('Espacio eliminado correctamente');
      
      // Recargar espacios
      const espaciosData = await espacioService.obtenerEspacios();
      setEspacios(Array.isArray(espaciosData) ? espaciosData : []);
    } catch (error) {
      message.error('Error al eliminar el espacio');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!estaAutenticado) {
      message.error('No hay sesión activa');
      return;
    }

    try {
      await espacioService.actualizarEspacio(
        espacioSeleccionado.inmueble_id,
        espacioSeleccionado.piso_id,
        espacioSeleccionado.id,
        formData
      );
      message.success('Espacio actualizado correctamente');
      setModalEditVisible(false);
      
      // Recargar espacios
      const espaciosData = await espacioService.obtenerEspacios();
      setEspacios(Array.isArray(espaciosData) ? espaciosData : []);
    } catch (error) {
      message.error('Error al actualizar el espacio');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleView = (record) => {
    setEspacioSeleccionado(record);
    setModalViewVisible(true);
  };

  // Agregar nueva función para limpiar filtros 
  const handleLimpiarFiltros = () => {
    setSelectedInmueble('');
    setSelectedPiso('');
    setSelectedTipoEspacio('');
    setSearchText('');
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Tipo",
      dataIndex: "tipo_espacio",
      key: "tipo_espacio",
      sorter: (a, b) => a.tipo_espacio.localeCompare(b.tipo_espacio),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
    },
    {
      title: "Precio",
      dataIndex: "precio",
      key: "precio",
      sorter: (a, b) => parseFloat(a.precio) - parseFloat(b.precio),
      render: (precio) => {
        const precioNumero = parseFloat(precio);
        return isNaN(precioNumero) ? 'S/ 0.00' : `S/ ${precioNumero.toFixed(2)}`;
      }
    },
    {
      title: "Capacidad",
      dataIndex: "capacidad",
      key: "capacidad",
      sorter: (a, b) => a.capacidad - b.capacidad,
    },
    {
      title: "Baño",
      dataIndex: "baño",
      key: "baño",
      render: (bano) => bano === 'propio' ? 'Propio' : 'Compartido'
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => estado === 0 ? 'Desocupado' : 'Ocupado'
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      render: (_, record) => (
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-primary btn-sm mx-1"
            onClick={() => handleView(record)}
            title="Ver detalles"
          >
            <i className="fas fa-eye" />
          </button>
          <button
            className="btn btn-warning btn-sm mx-1"
            onClick={() => handleEdit(record)}
            title="Editar"
          >
            <i className="fas fa-edit" />
          </button>
          <button
            className="btn btn-danger btn-sm mx-1"
            onClick={() => handleDelete(record)}
            title="Eliminar"
          >
            <i className="fas fa-trash" />
          </button>
        </div>
      ),
    },
  ];

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
    <Sidebar id='menu-item3' id1='menu-items3' activeClassName='espacios-registros'/>
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="#">Espacios</Link>
                </li>
                <li className="breadcrumb-item">
                  <i className="feather-chevron-right">
                    <FiChevronRight />
                  </i>
                </li>
                <li className="breadcrumb-item active">Lista de Espacios</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="card card-table show-entire">
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="page-table-header mb-2">
                  <div className="row align-items-center">
                    <div className="col">
                      <div className="doctor-table-blk">
                        <h3>Lista de Espacios</h3>
                        <div className="doctor-search-blk">
                          <div className="top-nav-search table-search-blk">
                            <form>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar aquí"
                                onChange={(e) => handleSearch(e.target.value)}
                              />
                            </form>
                          </div>
                          <div className="add-group">
                            <Link
                              to="/espacios-anadir"
                              className="btn btn-primary add-pluss ms-2"
                            >
                              <i className="fas fa-plus"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="staff-search-table">
                  <div className="card mb-4">
                    {/*<div className="card-header bg-light">
                      <h5 className="mb-0">
                        <i className="fas fa-filter me-2"></i>
                        Filtros de búsqueda
                      </h5>
                    </div>*/}
                    <div className="card-body">
                      <form>
                        <div className="row">
                          <div className="col-12 col-md-4 mb-3">
                            <div className="form-group local-forms">
                              <label>
                                <i className="fas fa-building me-2"></i>
                                Inmueble
                              </label>
                              <Select
                                classNamePrefix="select"
                                options={inmuebles.map(i => ({ value: i.id, label: i.nombre }))}
                                value={inmuebles.find(i => i.id === parseInt(selectedInmueble)) ? 
                                  { value: parseInt(selectedInmueble), label: inmuebles.find(i => i.id === parseInt(selectedInmueble)).nombre } : 
                                  null}
                                onChange={(selected) => handleInmuebleChange({ target: { value: selected?.value } })}
                                placeholder="Todos los inmuebles"
                                isClearable
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-4 mb-3">
                            <div className="form-group local-forms">
                              <label>
                                <i className="fas fa-layers me-2"></i>
                                Piso
                              </label>
                              <Select
                                classNamePrefix="select"
                                options={pisos.map(p => ({ value: p.id, label: p.nombre }))}
                                value={pisos.find(p => p.id === parseInt(selectedPiso)) ? 
                                  { value: parseInt(selectedPiso), label: pisos.find(p => p.id === parseInt(selectedPiso)).nombre } : 
                                  null}
                                onChange={(selected) => handlePisoChange({ target: { value: selected?.value } })}
                                placeholder="Todos los pisos"
                                isClearable
                                isDisabled={!selectedInmueble}
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-4 mb-3">
                            <div className="form-group local-forms">
                              <label>
                                <i className="fas fa-door-open me-2"></i>
                                Tipo de Espacio
                              </label>
                              <Select
                                classNamePrefix="select"
                                options={tipoEspacios.map(t => ({ value: t.id, label: t.nombre }))}
                                value={tipoEspacios.find(t => t.id === parseInt(selectedTipoEspacio)) ? 
                                  { value: parseInt(selectedTipoEspacio), label: tipoEspacios.find(t => t.id === parseInt(selectedTipoEspacio)).nombre } : 
                                  null}
                                onChange={(selected) => handleTipoEspacioChange({ target: { value: selected?.value } })}
                                placeholder="Todos los tipos"
                                isClearable
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-12 d-flex justify-content-end mb-3">
                            <button 
                              type="button" 
                              className="btn btn-primary me-2"
                              onClick={() => {}}
                            >
                              <i className="fas fa-filter me-2"></i>
                              Aplicar filtros
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-secondary" 
                              onClick={handleLimpiarFiltros}
                            >
                              <i className="fas fa-undo me-2"></i>
                              Limpiar
                            </button>
                          </div>
                        </div>
                      </form>
                      {(selectedInmueble || selectedPiso || selectedTipoEspacio || searchText) && (
                        <div className="alert alert-info mt-3">
                          <strong>Filtros aplicados:</strong>
                          {selectedInmueble && (
                            <span className="badge bg-primary me-2">
                              Inmueble: {inmuebles.find(i => i.id === parseInt(selectedInmueble))?.nombre}
                            </span>
                          )}
                          {selectedPiso && (
                            <span className="badge bg-primary me-2">
                              Piso: {pisos.find(p => p.id === parseInt(selectedPiso))?.nombre}
                            </span>
                          )}
                          {selectedTipoEspacio && (
                            <span className="badge bg-primary me-2">
                              Tipo: {tipoEspacios.find(t => t.id === parseInt(selectedTipoEspacio))?.nombre}
                            </span>
                          )}
                          {searchText && (
                            <span className="badge bg-primary me-2">
                              Búsqueda: {searchText}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <Table
                    columns={columns}
                    dataSource={espaciosFiltrados}
                    rowKey="id"
                    pagination={{
                      total: espaciosFiltrados.length,
                      showTotal: (total, range) =>
                        `Mostrando ${range[0]} de ${range[1]} de ${total} registros`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal de Edición */}
    <Modal
      title="Editar Espacio"
      open={modalEditVisible}
      onCancel={() => setModalEditVisible(false)}
      footer={null}
      width={800}
    >
      {espacioSeleccionado && (
        <form onSubmit={handleSubmitEdit}>
          <div className="row">
            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label>Nombre <span className="login-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label>Tipo de Espacio <span className="login-danger">*</span></label>
                <select
                  className="form-control"
                  name="tipoEspacio_id"
                  value={formData.tipoEspacio_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {tipoEspacios.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-12">
              <div className="form-group local-forms">
                <label>Descripción <span className="login-danger">*</span></label>
                <textarea
                  className="form-control"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label>Precio <span className="login-danger">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label>Capacidad <span className="login-danger">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label>Baño <span className="login-danger">*</span></label>
                <select
                  className="form-control"
                  name="bano"
                  value={formData.bano}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar tipo de baño</option>
                  <option value="propio">Propio</option>
                  <option value="compartido">Compartido</option>
                </select>
              </div>
            </div>

            <div className="col-12">
              <div className="doctor-submit text-end">
                <button type="submit" className="btn btn-primary submit-form me-2">
                  Actualizar
                </button>
                <button
                  type="button"
                  className="btn btn-secondary cancel-form"
                  onClick={() => setModalEditVisible(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </Modal>

    {/* Modal de Ver Detalles */}
    <Modal
      title="Detalles del Espacio"
      open={modalViewVisible}
      onCancel={() => setModalViewVisible(false)}
      footer={[
        <button 
          key="close" 
          className="btn btn-secondary" 
          onClick={() => setModalViewVisible(false)}
        >
          Cerrar
        </button>
      ]}
      width={800}
    >
      {espacioSeleccionado && (
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="view-details mb-3">
              <h5>Nombre:</h5>
              <p>{espacioSeleccionado.nombre}</p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="view-details mb-3">
              <h5>Tipo de Espacio:</h5>
              <p>{espacioSeleccionado.tipo_espacio}</p>
            </div>
          </div>

          <div className="col-12">
            <div className="view-details mb-3">
              <h5>Descripción:</h5>
              <p>{espacioSeleccionado.descripcion}</p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="view-details mb-3">
              <h5>Precio:</h5>
              <p>S/ {parseFloat(espacioSeleccionado.precio).toFixed(2)}</p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="view-details mb-3">
              <h5>Capacidad:</h5>
              <p>{espacioSeleccionado.capacidad} persona(s)</p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="view-details mb-3">
              <h5>Baño:</h5>
              <p>{espacioSeleccionado.baño === 'propio' ? 'Propio' : 'Compartido'}</p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="view-details mb-3">
              <h5>Estado:</h5>
              <p className={espacioSeleccionado.estado === 0 ? 'text-success' : 'text-danger'}>
                {espacioSeleccionado.estado === 0 ? 'Desocupado' : 'Ocupado'}
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
    </>
  );
};

export default EspaciosRegistros;
