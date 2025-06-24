import React, { useEffect, useState } from "react";
import '../../assets/styles/table-styles.css'; // Asegúrate de que la ruta sea correcta
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { blogimg10, imagesend, pdficon, pdficon3, pdficon4, plusicon, refreshicon, searchnormal, blogimg12,
  blogimg2, blogimg4, blogimg6, blogimg8} from '../../components/imagepath';
import { FiChevronRight } from "react-icons/fi";
import {onShowSizeChange,itemRender}from  '../../components/Pagination';
import { Table, Button, Space, Modal, message, Tag, Card, Row, Col, Statistic } from 'antd';
import Select from "react-select";
import { DatePicker} from "antd";
import inquilinoService from '../../services/inquilinoService';
import contratoService from '../../services/contratoService';
import { EyeOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined, HistoryOutlined } from '@ant-design/icons';
import personaService from '../../services/personaService';
import * as XLSX from 'xlsx';

const InquilinosRegistros = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [inquilinos, setInquilinos] = useState([]);
  const [todosLosContratos, setTodosLosContratos] = useState([]); // Estado para almacenar todos los contratos
  const [filteredInquilinos, setFilteredInquilinos] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInquilino, setSelectedInquilino] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false); // Modal para historial
  const [inquilinoSeleccionado, setInquilinoSeleccionado] = useState(null);
  const [historialContratos, setHistorialContratos] = useState([]); // Contratos del inquilino seleccionado
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documento: '',
    direccion: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchContratos();
  }, []);

  const fetchContratos = async () => {
    setLoading(true);
    try {
      const data = await contratoService.obtenerContratosDetalles();
      
      // Asegurarnos de que los datos sean un array
      const contratosArray = Array.isArray(data) ? data : [data];
      
      // Guardar todos los contratos para usar en el historial
      setTodosLosContratos(contratosArray);
      
      // Agrupar por inquilino y eliminar duplicados
      const inquilinosUnicos = {};
      
      contratosArray.forEach(contrato => {
        const dni = contrato.inquilino_dni;
        if (dni && !inquilinosUnicos[dni]) {
          // Encontrar el contrato más reciente (activo primero, luego por fecha)
          const contratosDelInquilino = contratosArray.filter(c => c.inquilino_dni === dni);
          const contratoActivo = contratosDelInquilino.find(c => c.estado === 'activo');
          const contratoMostrar = contratoActivo || contratosDelInquilino[0];
          
          inquilinosUnicos[dni] = {
            key: `inquilino_${dni}`, // Key único para cada inquilino
            inquilino_dni: dni,
            inquilino_nombre: contratoMostrar.inquilino_nombre || '',
            inquilino_apellido: contratoMostrar.inquilino_apellido || '',
            inquilino_email: contratoMostrar.inquilino_email || '',
            inquilino_telefono: contratoMostrar.inquilino_telefono || '',
            // Información del contrato principal (activo o más reciente)
            contrato_actual: contratoMostrar,
            total_contratos: contratosDelInquilino.length,
            contratos_activos: contratosDelInquilino.filter(c => c.estado === 'activo').length
          };
        }
      });
      
      // Convertir el objeto a array
      const inquilinosArray = Object.values(inquilinosUnicos);
      
      setInquilinos(inquilinosArray);
      setFilteredInquilinos(inquilinosArray);
    } catch (error) {
      console.error('Error al cargar los contratos:', error);
      message.error('Error al cargar los contratos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    const filtered = inquilinos.filter((inquilino) =>
      Object.values(inquilino).some((field) =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredInquilinos(filtered);
  };

  const handleViewDetails = (inquilino) => {
    // Crear un objeto compatible con el modal de detalles
    const inquilinoConContrato = {
      ...inquilino,
      // Campos del contrato actual para compatibilidad
      inmueble_nombre: inquilino.contrato_actual?.inmueble_nombre,
      espacio_nombre: inquilino.contrato_actual?.espacio_nombre,
      fecha_inicio: inquilino.contrato_actual?.fecha_inicio,
      fecha_fin: inquilino.contrato_actual?.fecha_fin,
      monto_alquiler: inquilino.contrato_actual?.monto_alquiler,
      monto_garantia: inquilino.contrato_actual?.monto_garantia,
      estado: inquilino.contrato_actual?.estado,
      descripcion: inquilino.contrato_actual?.descripcion,
      fecha_pago: inquilino.contrato_actual?.fecha_pago
    };
    
    setSelectedInquilino(inquilinoConContrato);
    setModalVisible(true);
  };

  const handleEdit = (inquilino) => {
    setInquilinoSeleccionado(inquilino);
    setFormData({
      nombre: inquilino.inquilino_nombre,
      apellido: inquilino.inquilino_apellido,
      email: inquilino.inquilino_email,
      telefono: inquilino.inquilino_telefono,
      documento: inquilino.inquilino_dni,
      direccion: inquilino.direccion || ''
    });
    setModalEditVisible(true);
  };

  // Nueva función para ver historial de contratos
  const handleViewHistorial = (inquilino) => {
    // Filtrar todos los contratos de este inquilino
    const contratosInquilino = todosLosContratos.filter(
      contrato => contrato.inquilino_dni === inquilino.inquilino_dni
    );
    
    setInquilinoSeleccionado(inquilino);
    setHistorialContratos(contratosInquilino);
    setModalHistorialVisible(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      // Validar campos requeridos
      const camposRequeridos = ['nombre', 'apellido', 'email', 'telefono', 'documento'];
      const camposFaltantes = camposRequeridos.filter(campo => !formData[campo]);
      
      if (camposFaltantes.length > 0) {
        message.error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        message.error('El email no tiene un formato válido');
        return;
      }

      // Validar formato de teléfono (9 dígitos)
      const telefonoRegex = /^\d{9}$/;
      if (!telefonoRegex.test(formData.telefono)) {
        message.error('El teléfono debe tener 9 dígitos');
        return;
      }

      // Validar formato de documento (8-10 dígitos)
      const documentoRegex = /^\d{8,10}$/;
      if (!documentoRegex.test(formData.documento)) {
        message.error('El documento debe tener entre 8 y 10 dígitos');
        return;
      }

      // Obtener el ID de la persona por DNI
      const personaResponse = await personaService.obtenerPersonaPorDocumento(formData.documento);
      if (!personaResponse) {
        message.error('No se encontró la persona con el documento especificado');
        return;
      }

      // Preparar datos para actualizar
      const personaData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        dni: formData.documento,
        direccion: formData.direccion || '',
        rol: 'inquilino'
      };

      // Actualizar la persona usando el ID correcto
      await personaService.actualizarPersona(personaResponse.id, personaData);
      
      // Guardar los datos actualizados y mostrar el modal de éxito
      setUpdatedData(formData);
      setModalEditVisible(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error al actualizar inquilino:', error);
      Modal.error({
        title: 'Error en la Actualización',
        content: `No se pudo actualizar el inquilino: ${error.response?.data?.message || error.message || 'Error desconocido'}`,
        okText: 'Aceptar'
      });
    }
  };

  // Función para manejar el cierre del modal de éxito
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    refreshData();
  };

  // Función para recargar los datos
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contratoService.obtenerContratosDetalles();
      
      // Asegurarnos de que los datos sean un array
      const contratosArray = Array.isArray(data) ? data : [data];
      
      // Guardar todos los contratos para usar en el historial
      setTodosLosContratos(contratosArray);
      
      // Agrupar por inquilino y eliminar duplicados
      const inquilinosUnicos = {};
      
      contratosArray.forEach(contrato => {
        const dni = contrato.inquilino_dni;
        if (dni && !inquilinosUnicos[dni]) {
          // Encontrar el contrato más reciente (activo primero, luego por fecha)
          const contratosDelInquilino = contratosArray.filter(c => c.inquilino_dni === dni);
          const contratoActivo = contratosDelInquilino.find(c => c.estado === 'activo');
          const contratoMostrar = contratoActivo || contratosDelInquilino[0];
          
          inquilinosUnicos[dni] = {
            key: `inquilino_${dni}`, // Key único para cada inquilino
            inquilino_dni: dni,
            inquilino_nombre: contratoMostrar.inquilino_nombre || '',
            inquilino_apellido: contratoMostrar.inquilino_apellido || '',
            inquilino_email: contratoMostrar.inquilino_email || '',
            inquilino_telefono: contratoMostrar.inquilino_telefono || '',
            // Información del contrato principal (activo o más reciente)
            contrato_actual: contratoMostrar,
            total_contratos: contratosDelInquilino.length,
            contratos_activos: contratosDelInquilino.filter(c => c.estado === 'activo').length
          };
        }
      });
      
      // Convertir el objeto a array
      const inquilinosArray = Object.values(inquilinosUnicos);

      setInquilinos(inquilinosArray);
      setFilteredInquilinos(inquilinosArray);
      message.success('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
      setError('Error al cargar los datos');
      message.error('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (inquilino) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar este inquilino?',
      content: `Esta acción eliminará al inquilino ${inquilino.inquilino_nombre} ${inquilino.inquilino_apellido} y no podrá ser revertida.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'No, cancelar',
      onOk: async () => {
        try {
          await inquilinoService.eliminarInquilino(inquilino.id);
          message.success('Inquilino eliminado correctamente');
          // Recargar la lista de inquilinos
          fetchContratos();
        } catch (error) {
          console.error('Error al eliminar inquilino:', error);
          message.error('Error al eliminar el inquilino');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Inquilino',
      dataIndex: 'inquilino_nombre',
      key: 'inquilino',
      render: (text, record) => `${record.inquilino_nombre} ${record.inquilino_apellido}`,
    },
    {
      title: 'Documento',
      dataIndex: 'inquilino_dni',
      key: 'documento',
    },
    {
      title: 'Email',
      dataIndex: 'inquilino_email',
      key: 'email',
    },
    {
      title: 'Teléfono',
      dataIndex: 'inquilino_telefono',
      key: 'telefono',
    },
    {
      title: 'Contratos',
      key: 'contratos',
      render: (_, record) => (
        <div>
          <div><strong>Total:</strong> {record.total_contratos}</div>
          <div><strong>Activos:</strong> {record.contratos_activos}</div>
        </div>
      ),
    },
    {
      title: 'Estado Actual',
      key: 'estado',
      render: (_, record) => (
        <Tag color={record.contrato_actual?.estado === 'activo' ? 'green' : record.contrato_actual?.estado === 'inactivo' ? 'orange' : 'red'}>
          {record.contrato_actual?.estado || 'Sin contrato'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            className="btn btn-primary btn-sm mx-1"
            type="primary" 
            onClick={() => handleViewDetails(record)}
            title="Ver detalles del contrato actual"
          >
            <EyeOutlined />
          </Button>
          <Button
            className="btn btn-info btn-sm mx-1"
            type="primary"
            onClick={() => handleViewHistorial(record)}
            title="Ver historial de contratos"
          >
            <HistoryOutlined />
          </Button>
          <Button
            className="btn btn-warning btn-sm mx-1"
            type="primary"
            onClick={() => handleEdit(record)}
            title="Editar inquilino"
          >
            <EditOutlined />
          </Button>
          <Button
            className="btn btn-danger btn-sm mx-1"
            type="primary"
            onClick={() => handleDelete(record)}
            title="Eliminar inquilino"
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const renderInquilinoInfo = (inquilino) => {
    if (!inquilino) return null;

    return (
      <Card title="Información del Contrato" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="Fecha Inicio" value={new Date(inquilino.fecha_inicio).toLocaleDateString()} />
          </Col>
          <Col span={8}>
            <Statistic title="Fecha Fin" value={new Date(inquilino.fecha_fin).toLocaleDateString()} />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Monto Mensual" 
              value={`$${parseFloat(inquilino.monto_alquiler).toFixed(2)}`}
              precision={2}
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Statistic 
              title="Depósito" 
              value={`$${parseFloat(inquilino.monto_garantia).toFixed(2)}`}
              precision={2}
            />
          </Col>
          <Col span={8}>
            <Statistic title="Estado" value={inquilino.estado} />
          </Col>
          <Col span={8}>
            <Statistic title="Fecha de Pago" value={new Date(inquilino.fecha_pago).toLocaleDateString()} />
          </Col>
        </Row>
        {inquilino.descripcion && (
          <div style={{ marginTop: 16 }}>
            <h4>Observaciones:</h4>
            <p>{inquilino.descripcion}</p>
          </div>
        )}
      </Card>
    );
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    try {
      const dataForExcel = filteredInquilinos.map(item => ({
        'Nombre': `${item.inquilino_nombre} ${item.inquilino_apellido}`,
        'Documento': item.inquilino_dni,
        'Email': item.inquilino_email,
        'Teléfono': item.inquilino_telefono,
        'Total Contratos': item.total_contratos,
        'Contratos Activos': item.contratos_activos,
        'Estado Actual': item.contrato_actual?.estado || 'Sin contrato',
        'Inmueble Actual': item.contrato_actual?.inmueble_nombre || 'N/A',
        'Espacio Actual': item.contrato_actual?.espacio_nombre || 'N/A'
      }));
      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inquilinos");
      // Guardar archivo
      const fecha = new Date().toISOString().slice(0,10);
      const fileName = `Inquilinos_${fecha}.xlsx`;
      XLSX.writeFile(wb, fileName);
      message.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      message.error('Error al exportar el reporte');
    }
  };

  return (
    <>
    <Header />
    <Sidebar id='menu-item3' id1='menu-items3' activeClassName='inquilinos-registros'/>
    <>
  <div className="page-wrapper">
    <div className="content">
      {/* Page Header */}
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="#">Inquilinos </Link>
            </li>
              <li className="breadcrumb-item">
                <i className="feather-chevron-right">
                  <FiChevronRight />
                  </i>
              </li>
              <li className="breadcrumb-item active">Lista de Inquilinos</li>
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
                      <h3>Lista de Inquilinos</h3>
                      <div className="doctor-search-blk">
                        <div className="top-nav-search table-search-blk">
                          <form>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Buscar aquí"
                              value={filter}
                              onChange={handleFilterChange}
                            />
                            <Link className="btn">
                              <img
                                src={searchnormal}
                                alt="#"
                              />
                            </Link>
                          </form>
                        </div>
                        <div className="add-group">
                          <Link
                            to="/inquilinos-registrar"
                            className="btn btn-primary add-pluss ms-2"
                          >
                            <img src={plusicon} alt="#" />
                          </Link>
                          <button
                            className="btn btn-primary doctor-refresh ms-2"
                            onClick={refreshData}
                            title="Actualizar datos"
                            disabled={loading}
                          >
                            {loading ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              <i className="fas fa-sync-alt"></i>
                            )}
                          </button>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-auto text-end float-end ms-auto download-grp">
                      <button
                        className="btn btn-outline-success ms-2"
                        onClick={exportToExcel}
                        title="Exportar a Excel"
                      >
                      <FileExcelOutlined />
                      </button>
                  </div>
                </div>
              </div>
              {/* /Table Header */}

              {/*<div className="staff-search-table">
                      <form>
                        <div className="row">
              
                        <div className="col-12 col-md-6 col-xl-4">
                            <div className="form-group local-forms">
                              <label>Nombre Inquilino </label>
                              <input className="form-control" type="text" />
                            </div>
                          </div>
                          
                          <div className="col-12 col-md-6 col-xl-4">
                            <div className="doctor-submit">
                              <button
                                type="submit"
                                className="btn btn-primary submit-list-form me-2"
                              >
                                Aplicar Filtro
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
              </div>*/}


              <div className="table-responsive doctor-list">
              <Table
                        pagination={{
                          total: filteredInquilinos.length,
                          showTotal: (total, range) =>
                          `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
                         
                        }}
                        columns={columns}
                        dataSource={filteredInquilinos}
                        loading={loading}
                        rowKey="id"
                        style={{
                          backgroundColor: '#f2f2f2', // Replace with your desired background color for the table
                        }}
                      />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </div>

    <Modal
      title="Detalles del Contrato"
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
      width={800}
    >
      {selectedInquilino && (
        <>
          <Card title="Información del Inquilino">
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Nombre:</strong> {selectedInquilino.inquilino_nombre} {selectedInquilino.inquilino_apellido}</p>
                <p><strong>Documento:</strong> {selectedInquilino.inquilino_dni}</p>
                <p><strong>Email:</strong> {selectedInquilino.inquilino_email}</p>
              </Col>
              <Col span={12}>
                <p><strong>Teléfono:</strong> {selectedInquilino.inquilino_telefono}</p>
                <p><strong>Inmueble:</strong> {selectedInquilino.inmueble_nombre}</p>
                <p><strong>Espacio:</strong> {selectedInquilino.espacio_nombre}</p>
              </Col>
            </Row>
          </Card>
          {renderInquilinoInfo(selectedInquilino)}
        </>
      )}
    </Modal>

    {/* Modal de Edición */}
    <Modal
      title="Editar Inquilino"
      open={modalEditVisible}
      onCancel={() => setModalEditVisible(false)}
      footer={null}
      width={800}
    >
      {inquilinoSeleccionado && (
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
                <label>Apellido <span className="login-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label>Email <span className="login-danger">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label>Teléfono <span className="login-danger">*</span></label>
                <input
                  type="tel"
                  className="form-control"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label>Documento <span className="login-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-12">
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

    {/* Modal de éxito */}
    <Modal
      title="¡Actualización Exitosa!"
      visible={showSuccessModal}
      onOk={handleSuccessModalClose}
      onCancel={handleSuccessModalClose}
      okText="Aceptar"
      cancelButtonProps={{ style: { display: 'none' } }}
      centered
    >
      <div>
        <p>El inquilino se ha actualizado correctamente con los siguientes datos:</p>
        {updatedData && (
          <ul style={{ listStyleType: 'none', padding: '10px' }}>
            <li><strong>Nombre:</strong> {updatedData.nombre} {updatedData.apellido}</li>
            <li><strong>Email:</strong> {updatedData.email}</li>
            <li><strong>Teléfono:</strong> {updatedData.telefono}</li>
            <li><strong>Documento:</strong> {updatedData.documento}</li>
          </ul>
        )}
      </div>
    </Modal>

    {/* Modal de Historial de Contratos */}
    <Modal
      title={<><HistoryOutlined className="me-2" />Historial de Contratos</>}
      open={modalHistorialVisible}
      onCancel={() => setModalHistorialVisible(false)}
      footer={[
        <Button key="close" onClick={() => setModalHistorialVisible(false)}>
          Cerrar
        </Button>
      ]}
      width={1200}
      destroyOnClose={true}
      centered
    >
      {inquilinoSeleccionado && (
        <div>
          <Card title="Información del Inquilino" className="mb-4">
            <Row gutter={16}>
              <Col span={8}>
                <p><strong>Nombre:</strong> {inquilinoSeleccionado.inquilino_nombre} {inquilinoSeleccionado.inquilino_apellido}</p>
              </Col>
              <Col span={8}>
                <p><strong>Documento:</strong> {inquilinoSeleccionado.inquilino_dni}</p>
              </Col>
              <Col span={8}>
                <p><strong>Email:</strong> {inquilinoSeleccionado.inquilino_email}</p>
              </Col>
            </Row>
          </Card>

          <Card title={`Historial de Contratos (${historialContratos.length} contrato${historialContratos.length !== 1 ? 's' : ''})`}>
            <div className="table-responsive">
              <Table
                columns={[
                  {
                    title: 'ID Contrato',
                    dataIndex: 'id',
                    key: 'id',
                    width: 100,
                  },
                  {
                    title: 'Inmueble',
                    dataIndex: 'inmueble_nombre',
                    key: 'inmueble',
                  },
                  {
                    title: 'Espacio',
                    dataIndex: 'espacio_nombre',
                    key: 'espacio',
                  },
                  {
                    title: 'Fecha Inicio',
                    dataIndex: 'fecha_inicio',
                    key: 'fecha_inicio',
                    render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : 'N/A',
                  },
                  {
                    title: 'Fecha Fin',
                    dataIndex: 'fecha_fin',
                    key: 'fecha_fin',
                    render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : 'N/A',
                  },
                  {
                    title: 'Monto Alquiler',
                    dataIndex: 'monto_alquiler',
                    key: 'monto_alquiler',
                    render: (monto) => monto ? `S/ ${parseFloat(monto).toFixed(2)}` : 'N/A',
                  },
                  {
                    title: 'Estado',
                    dataIndex: 'estado',
                    key: 'estado',
                    render: (estado) => (
                      <Tag color={
                        estado === 'activo' ? 'green' : 
                        estado === 'inactivo' ? 'orange' : 
                        estado === 'finalizado' ? 'blue' : 
                        'red'
                      }>
                        {estado || 'Sin estado'}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Acciones',
                    key: 'acciones',
                    render: (_, record) => (
                      <Button
                        type="link"
                        onClick={() => {
                          setSelectedInquilino({
                            ...inquilinoSeleccionado,
                            contrato_actual: record,
                            // Agregar campos del contrato para compatibilidad
                            inmueble_nombre: record.inmueble_nombre,
                            espacio_nombre: record.espacio_nombre,
                            fecha_inicio: record.fecha_inicio,
                            fecha_fin: record.fecha_fin,
                            monto_alquiler: record.monto_alquiler,
                            monto_garantia: record.monto_garantia,
                            estado: record.estado,
                            descripcion: record.descripcion,
                            fecha_pago: record.fecha_pago
                          });
                          setModalHistorialVisible(false);
                          setModalVisible(true);
                        }}
                        title="Ver detalles de este contrato"
                      >
                        <EyeOutlined /> Ver
                      </Button>
                    ),
                  },
                ]}
                dataSource={historialContratos}
                rowKey="id"
                pagination={{
                  pageSize: 5,
                  showTotal: (total, range) =>
                    `Mostrando ${range[0]} a ${range[1]} de ${total} contratos`,
                }}
                size="small"
              />
            </div>
            
            {historialContratos.length === 0 && (
              <div className="text-center p-4">
                <p className="text-muted">No se encontraron contratos para este inquilino.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </Modal>
</>
    
    </>
  );
};

export default InquilinosRegistros;
