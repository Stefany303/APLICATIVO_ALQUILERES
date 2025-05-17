import React, { useEffect, useState } from "react";
import '../../assets/styles/table-styles.css';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { plusicon, refreshicon, searchnormal, pdficon, pdficon3, pdficon4 } from '../../components/imagepath';
import { FiChevronRight } from "react-icons/fi";
import { onShowSizeChange, itemRender } from '../../components/Pagination';
import { Table, Select, DatePicker, message, Spin, Modal, Button, Form, Input, DatePicker as AntDatePicker } from 'antd';
import { useAuth } from "../../utils/AuthContext";
import contratoService from "../../services/contratoService";
import inmuebleService from "../../services/inmuebleService";
import pisoService from "../../services/pisoService";
import moment from 'moment';
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { RangePicker } = AntDatePicker;

const ContratoRegistros = () => {
  const navigate = useNavigate();
  const { estaAutenticado } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  
  // Estados para datos
  const [contratos, setContratos] = useState([]);
  const [filteredContratos, setFilteredContratos] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  
  // Estados para filtros
  const [selectedInmueble, setSelectedInmueble] = useState(null);
  const [selectedPiso, setSelectedPiso] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedEstado, setSelectedEstado] = useState(null);
  
  // Estados para modales
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);
  
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  // Verificar autenticación
  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
    }
  }, [estaAutenticado, navigate]);

  // Cargar datos iniciales
  useEffect(() => {
    if (!estaAutenticado) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar inmuebles para los filtros
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        setInmuebles(inmueblesData);
        
        // Cargar contratos con detalles
        const contratosData = await contratoService.obtenerContratosDetalles();
        
        if (Array.isArray(contratosData)) {
          setContratos(contratosData);
          setFilteredContratos(contratosData);
        } else {
          console.error('Los datos de contratos no son un array:', contratosData);
          setContratos([]);
          setFilteredContratos([]);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo más tarde.");
        message.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [estaAutenticado]);

  // Cargar pisos cuando se selecciona un inmueble
  useEffect(() => {
    if (!selectedInmueble) {
      setPisos([]);
      return;
    }
    
    const fetchPisos = async () => {
      try {
        const pisosData = await pisoService.obtenerPorInmueble(selectedInmueble);
        setPisos(pisosData);
      } catch (err) {
        console.error("Error al cargar pisos:", err);
        setPisos([]);
        message.error("Error al cargar los pisos");
      }
    };
    
    fetchPisos();
  }, [selectedInmueble]);

  // Aplicar filtros
  useEffect(() => {
    if (!contratos.length) return;
    
    let filtered = [...contratos];
    
    // Filtrar por inmueble
    if (selectedInmueble) {
      filtered = filtered.filter(contrato => 
        contrato.inmueble_id && contrato.inmueble_id.toString() === selectedInmueble.toString()
      );
    }
    
    // Filtrar por piso
    if (selectedPiso) {
      filtered = filtered.filter(contrato => 
        contrato.piso_id && contrato.piso_id.toString() === selectedPiso.toString()
      );
    }
    
    // Filtrar por estado
    if (selectedEstado) {
      filtered = filtered.filter(contrato => 
        contrato.estado && contrato.estado.toLowerCase() === selectedEstado.toLowerCase()
      );
    }
    
    // Filtrar por texto de búsqueda
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(contrato => 
        (contrato.inquilino_nombre && contrato.inquilino_nombre.toLowerCase().includes(searchLower)) ||
        (contrato.inquilino_apellido && contrato.inquilino_apellido.toLowerCase().includes(searchLower)) ||
        (contrato.espacio_nombre && contrato.espacio_nombre.toLowerCase().includes(searchLower)) ||
        (contrato.inmueble_nombre && contrato.inmueble_nombre.toLowerCase().includes(searchLower)) ||
        (contrato.descripcion && contrato.descripcion.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredContratos(filtered);
  }, [contratos, selectedInmueble, selectedPiso, selectedEstado, searchText]);

  const handleInmuebleChange = (value) => {
    setSelectedInmueble(value);
    setSelectedPiso(null); // Reiniciar piso al cambiar inmueble
  };

  const handlePisoChange = (value) => {
    setSelectedPiso(value);
  };

  const handleEstadoChange = (value) => {
    setSelectedEstado(value);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const contratosData = await contratoService.obtenerContratosDetalles();
      setContratos(Array.isArray(contratosData) ? contratosData : []);
      message.success("Datos actualizados");
    } catch (err) {
      console.error("Error al actualizar datos:", err);
      message.error("Error al actualizar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => {
    const contrato = contratos.find(c => c.id === id);
    if (contrato) {
      setContratoSeleccionado(contrato);
      setViewModalVisible(true);
    } else {
      message.error("No se encontró el contrato seleccionado");
    }
  };

  const handleEdit = (id) => {
    const contrato = contratos.find(c => c.id === id);
    if (contrato) {
      setContratoSeleccionado(contrato);
      
      // Configurar valores iniciales del formulario
      form.setFieldsValue({
        monto_alquiler: contrato.monto_alquiler,
        monto_garantia: contrato.monto_garantia,
        descripcion: contrato.descripcion,
        estado: contrato.estado,
        fechas: [
          moment(contrato.fecha_inicio),
          moment(contrato.fecha_fin)
        ],
        fecha_pago: moment(contrato.fecha_pago)
      });
      
      setEditModalVisible(true);
    } else {
      message.error("No se encontró el contrato seleccionado");
    }
  };

  const handleSaveEdit = async () => {
    try {
      setLoadingSave(true);
      // Validar formulario
      const values = await form.validateFields();
      
      // Preparar datos para enviar
      const contratoData = {
        monto_alquiler: values.monto_alquiler,
        monto_garantia: values.monto_garantia,
        descripcion: values.descripcion,
        estado: values.estado,
        fecha_inicio: values.fechas[0].format('YYYY-MM-DD'),
        fecha_fin: values.fechas[1].format('YYYY-MM-DD'),
        fecha_pago: values.fecha_pago.format('YYYY-MM-DD')
      };
      
      // Llamar al servicio para actualizar
      await contratoService.actualizarContrato(contratoSeleccionado.id, contratoData);
      
      // Actualizar la lista
      handleRefresh();
      
      // Cerrar modal y mostrar mensaje
      setEditModalVisible(false);
      message.success("Contrato actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar contrato:", err);
      message.error("Error al guardar cambios: " + (err.message || "Error desconocido"));
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id) => {
    if (!estaAutenticado) {
      message.error("No hay sesión activa");
      return;
    }
    
    try {
      await contratoService.eliminarContrato(id);
      message.success("Contrato eliminado correctamente");
      
      // Actualizar la lista de contratos
      const contratosData = await contratoService.obtenerContratosDetalles();
      setContratos(Array.isArray(contratosData) ? contratosData : []);
    } catch (err) {
      console.error("Error al eliminar contrato:", err);
      message.error("Error al eliminar el contrato");
    }
  };

  const handleLimpiarFiltros = () => {
    setSelectedInmueble(null);
    setSelectedPiso(null);
    setSelectedEstado(null);
    setSearchText("");
  };

  const columns = [
    {
      title: "Inquilino",
      key: "inquilino",
      render: (text, record) => `${record.inquilino_nombre || ''} ${record.inquilino_apellido || ''}`,
      sorter: (a, b) => {
        const nombreA = `${a.inquilino_nombre || ''} ${a.inquilino_apellido || ''}`;
        const nombreB = `${b.inquilino_nombre || ''} ${b.inquilino_apellido || ''}`;
        return nombreA.localeCompare(nombreB);
      }
    },
    {
      title: "Espacio",
      dataIndex: "espacio_nombre",
      sorter: (a, b) => a.espacio_nombre?.localeCompare(b.espacio_nombre || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Inmueble",
      dataIndex: "inmueble_nombre",
      sorter: (a, b) => a.inmueble_nombre?.localeCompare(b.inmueble_nombre || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Fecha Inicio",
      dataIndex: "fecha_inicio",
      sorter: (a, b) => new Date(a.fecha_inicio || 0) - new Date(b.fecha_inicio || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Fecha Fin",
      dataIndex: "fecha_fin",
      sorter: (a, b) => new Date(a.fecha_fin || 0) - new Date(b.fecha_fin || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Monto Alquiler",
      dataIndex: "monto_alquiler",
      sorter: (a, b) => (parseFloat(a.monto_alquiler) || 0) - (parseFloat(b.monto_alquiler) || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${parseFloat(monto).toFixed(2)}` : "N/A"),
    },
    {
      title: "Monto Garantía",
      dataIndex: "monto_garantia",
      sorter: (a, b) => (parseFloat(a.monto_garantia) || 0) - (parseFloat(b.monto_garantia) || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${parseFloat(monto).toFixed(2)}` : "N/A"),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      sorter: (a, b) => a.estado?.localeCompare(b.estado || ''),
      render: (estado) => {
        if (!estado) return "N/A";
        
        const estadoColores = {
          activo: "text-success",
          inactivo: "text-warning",
          finalizado: "text-danger",
        };
        return <span className={estadoColores[estado.toLowerCase()] || ""}>{estado}</span>;
      },
    },
    {
      title: "Fecha Pago",
      dataIndex: "fecha_pago",
      sorter: (a, b) => new Date(a.fecha_pago || 0) - new Date(b.fecha_pago || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div className="action-buttons d-flex justify-content-center">
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => handleView(record.id)}
            title="Ver detalles"
          >
            <EyeOutlined />
          </button>
          <button 
            className="btn btn-sm btn-warning me-2"
            onClick={() => handleEdit(record.id)}
            title="Editar contrato"
          >
            <EditOutlined />
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(record.id)}
            title="Eliminar contrato"
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <Sidebar id="menu-item5" id1="menu-items5" activeClassName="contrato-registros" />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Contratos</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FiChevronRight />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Lista de Contratos</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          
          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  {/* Table Header */}
                  <div className="page-table-header mb-2">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="doctor-table-blk">
                          <h3>Lista de Contratos</h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <form>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Buscar por inquilino, espacio..."
                                  value={searchText}
                                  onChange={handleSearch}
                                />
                                <button className="btn" type="button">
                                  <SearchOutlined />
                                </button>
                              </form>
                            </div>
                            <div className="add-group">
                              <Link
                                to="/contrato-generar"
                                className="btn btn-primary add-pluss ms-2"
                                title="Generar nuevo contrato"
                              >
                                <PlusOutlined />
                              </Link>
                              <button
                                className="btn btn-primary doctor-refresh ms-2"
                                onClick={handleRefresh}
                                title="Actualizar datos"
                              >
                                <i className="fas fa-sync-alt"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-auto text-end float-end ms-auto download-grp">
                        <button className="btn btn-outline-primary me-2" title="Exportar a PDF">
                          <i className="fas fa-file-pdf"></i>
                        </button>
                        <button className="btn btn-outline-primary me-2" title="Exportar a Excel">
                          <i className="fas fa-file-excel"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* /Table Header */}

                  {/* Filtros */}
                  <div className="staff-search-table mb-4">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h5 className="mb-0">
                          <i className="fas fa-filter me-2"></i>
                          Filtros de búsqueda
                        </h5>
                      </div>
                      <div className="card-body">
                        <form>
                          <div className="row">
                            <div className="col-12 col-md-4 mb-3">
                              <div className="form-group local-forms">
                                <label>Inmueble</label>
                                <Select
                                  placeholder="Seleccionar inmueble"
                                  allowClear
                                  style={{ width: '100%' }}
                                  value={selectedInmueble}
                                  onChange={handleInmuebleChange}
                                  options={inmuebles.map(inmueble => ({
                                    value: inmueble.id,
                                    label: inmueble.nombre
                                  }))}
                                />
                              </div>
                            </div>
                            <div className="col-12 col-md-4 mb-3">
                              <div className="form-group local-forms">
                                <label>Piso</label>
                                <Select
                                  placeholder="Seleccionar piso"
                                  allowClear
                                  style={{ width: '100%' }}
                                  value={selectedPiso}
                                  onChange={handlePisoChange}
                                  options={pisos.map(piso => ({
                                    value: piso.id,
                                    label: piso.nombre
                                  }))}
                                  disabled={!selectedInmueble}
                                />
                              </div>
                            </div>
                            <div className="col-12 col-md-4 mb-3">
                              <div className="form-group local-forms">
                                <label>Estado del contrato</label>
                                <Select
                                  placeholder="Seleccionar estado"
                                  allowClear
                                  style={{ width: '100%' }}
                                  value={selectedEstado}
                                  onChange={handleEstadoChange}
                                  options={[
                                    { value: 'activo', label: 'Activo' },
                                    { value: 'inactivo', label: 'Inactivo' },
                                    { value: 'finalizado', label: 'Finalizado' }
                                  ]}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-12 d-flex justify-content-end">
                              <button 
                                type="button" 
                                className="btn btn-secondary me-2"
                                onClick={handleLimpiarFiltros}
                              >
                                <i className="fas fa-undo me-1"></i> Limpiar filtros
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  {/* /Filtros */}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center my-4">
                      <Spin tip="Cargando datos..." />
                    </div>
                  ) : (
                    <div className="table-responsive doctor-list">
                      <Table
                        pagination={{
                          total: filteredContratos.length,
                          showTotal: (total, range) =>
                            `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
                          showSizeChanger: true,
                          onShowSizeChange: onShowSizeChange,
                          itemRender: itemRender,
                        }}
                        columns={columns}
                        dataSource={filteredContratos}
                        rowKey={(record) => record.id}
                        rowSelection={rowSelection}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ver Detalles */}
      <Modal
        title="Detalles del Contrato"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="cerrar" onClick={() => setViewModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {contratoSeleccionado && (
          <div className="contract-details">
            <div className="row mb-3">
              <div className="col-md-6">
                <h5 className="text-primary">Información del Inquilino</h5>
                <div className="detail-item">
                  <strong>Nombre:</strong> {contratoSeleccionado.inquilino_nombre} {contratoSeleccionado.inquilino_apellido}
                </div>
                <div className="detail-item">
                  <strong>DNI:</strong> {contratoSeleccionado.inquilino_dni || 'No disponible'}
                </div>
                <div className="detail-item">
                  <strong>Email:</strong> {contratoSeleccionado.inquilino_email || 'No disponible'}
                </div>
                <div className="detail-item">
                  <strong>Teléfono:</strong> {contratoSeleccionado.inquilino_telefono || 'No disponible'}
                </div>
              </div>
              <div className="col-md-6">
                <h5 className="text-primary">Información del Espacio</h5>
                <div className="detail-item">
                  <strong>Inmueble:</strong> {contratoSeleccionado.inmueble_nombre || 'No disponible'}
                </div>
                <div className="detail-item">
                  <strong>Espacio:</strong> {contratoSeleccionado.espacio_nombre || 'No disponible'}
                </div>
                <div className="detail-item">
                  <strong>Descripción:</strong> {contratoSeleccionado.espacio_descripcion || 'No disponible'}
                </div>
                <div className="detail-item">
                  <strong>Precio base:</strong> S/ {parseFloat(contratoSeleccionado.espacio_precio).toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <h5 className="text-primary">Información del Contrato</h5>
                <div className="detail-item">
                  <strong>Fecha de inicio:</strong> {new Date(contratoSeleccionado.fecha_inicio).toLocaleDateString()}
                </div>
                <div className="detail-item">
                  <strong>Fecha de fin:</strong> {new Date(contratoSeleccionado.fecha_fin).toLocaleDateString()}
                </div>
                <div className="detail-item">
                  <strong>Día de pago mensual:</strong> {new Date(contratoSeleccionado.fecha_pago).toLocaleDateString()}
                </div>
                <div className="detail-item">
                  <strong>Estado:</strong> <span className={`badge ${contratoSeleccionado.estado === 'activo' ? 'bg-success' : contratoSeleccionado.estado === 'inactivo' ? 'bg-warning' : 'bg-danger'}`}>{contratoSeleccionado.estado}</span>
                </div>
              </div>
              <div className="col-md-6">
                <h5 className="text-primary">Información Económica</h5>
                <div className="detail-item">
                  <strong>Monto de alquiler:</strong> S/ {parseFloat(contratoSeleccionado.monto_alquiler).toFixed(2)}
                </div>
                <div className="detail-item">
                  <strong>Monto de garantía:</strong> S/ {parseFloat(contratoSeleccionado.monto_garantia).toFixed(2)}
                </div>
                <div className="detail-item">
                  <strong>Documento:</strong> {contratoSeleccionado.documento || 'No disponible'}
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-12">
                <h5 className="text-primary">Observaciones</h5>
                <div className="card">
                  <div className="card-body">
                    <p>{contratoSeleccionado.descripcion || 'Sin observaciones'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Editar */}
      <Modal
        title="Editar Contrato"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancelar" onClick={() => setEditModalVisible(false)}>
            Cancelar
          </Button>,
          <Button 
            key="guardar" 
            type="primary" 
            loading={loadingSave} 
            onClick={handleSaveEdit}
            icon={<SaveOutlined />}
          >
            Guardar Cambios
          </Button>
        ]}
        width={700}
      >
        {contratoSeleccionado && (
          <Form
            form={form}
            layout="vertical"
          >
            <div className="row">
              <div className="col-md-12 mb-3">
                <h5>Contrato para: {contratoSeleccionado.inquilino_nombre} {contratoSeleccionado.inquilino_apellido}</h5>
                <p>Espacio: {contratoSeleccionado.espacio_nombre} en {contratoSeleccionado.inmueble_nombre}</p>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="fechas"
                  label="Periodo del Contrato"
                  rules={[{ required: true, message: 'Por favor seleccione las fechas de inicio y fin' }]}
                >
                  <RangePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="fecha_pago"
                  label="Fecha de Pago Mensual"
                  rules={[{ required: true, message: 'Por favor seleccione la fecha de pago' }]}
                >
                  <AntDatePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="monto_alquiler"
                  label="Monto de Alquiler"
                  rules={[{ required: true, message: 'Por favor ingrese el monto de alquiler' }]}
                >
                  <Input 
                    prefix="S/" 
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="monto_garantia"
                  label="Monto de Garantía"
                  rules={[{ required: true, message: 'Por favor ingrese el monto de garantía' }]}
                >
                  <Input 
                    prefix="S/" 
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="estado"
                  label="Estado"
                  rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
                >
                  <Select>
                    <Select.Option value="activo">Activo</Select.Option>
                    <Select.Option value="inactivo">Inactivo</Select.Option>
                    <Select.Option value="finalizado">Finalizado</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              
              <div className="col-md-12">
                <Form.Item
                  name="descripcion"
                  label="Observaciones"
                >
                  <TextArea rows={4} />
                </Form.Item>
              </div>
            </div>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default ContratoRegistros;
