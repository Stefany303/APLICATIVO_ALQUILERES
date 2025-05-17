import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from "react-icons/fi";
import { Table, Modal, Form, Input, Select, Button, Spin, message, InputNumber } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { plusicon, refreshicon, searchnormal, pdficon, pdficon3, pdficon4 } from '../../components/imagepath';
import contratoService from '../../services/contratoService';
import inmuebleService from '../../services/inmuebleService';
import { useAuth } from '../../utils/AuthContext';

const { TextArea } = Input;
const { Option } = Select;

const InmuebleRegistros = () => {
  const { estaAutenticado } = useAuth();
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Estados para modales
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inmueblesFiltrados, setInmueblesFiltrados] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [error, setError] = useState(null);

  // Actualizar el ancho de la ventana al cambiar el tamaño
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Verificar autenticación
  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
    }
  }, [estaAutenticado, navigate]);

  // Obtener los inmuebles y propietarios al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener inmuebles
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        console.log('Inmuebles obtenidos:', inmueblesData);
        
        // Asegurarnos de que los datos sean un array
        const inmueblesArray = Array.isArray(inmueblesData) ? inmueblesData : [];
        setInmuebles(inmueblesArray);
        setInmueblesFiltrados(inmueblesArray);
        
        // Obtener propietarios para el formulario de edición
        try {
          const propietariosData = await inmuebleService.obtenerPropietarios();
          setPropietarios(Array.isArray(propietariosData) ? propietariosData : []);
        } catch (err) {
          console.error("Error al obtener propietarios:", err);
          setPropietarios([]);
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setError("Error al cargar los inmuebles. Por favor, intente de nuevo más tarde.");
        message.error("Error al cargar los inmuebles");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Efecto para aplicar filtro de búsqueda
  useEffect(() => {
    if (!searchText.trim()) {
      setInmueblesFiltrados(inmuebles);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = inmuebles.filter(inmueble => 
      (inmueble.nombre && inmueble.nombre.toLowerCase().includes(searchLower)) || 
      (inmueble.direccion && inmueble.direccion.toLowerCase().includes(searchLower)) ||
      (inmueble.propietario_nombre && inmueble.propietario_nombre.toLowerCase().includes(searchLower)) ||
      (inmueble.tipo_inmueble && inmueble.tipo_inmueble.toLowerCase().includes(searchLower))
    );
    
    setInmueblesFiltrados(filtered);
  }, [searchText, inmuebles]);

  // Función para actualizar datos
  const refreshData = async () => {
    try {
      setLoading(true);
      const inmueblesData = await inmuebleService.obtenerInmuebles();
      const inmueblesArray = Array.isArray(inmueblesData) ? inmueblesData : [];
      setInmuebles(inmueblesArray);
      setInmueblesFiltrados(inmueblesArray);
      message.success("Datos actualizados");
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      message.error("Error al actualizar los datos");
    } finally {
      setLoading(false);
    }
  };

  // Acción para ver detalles de un inmueble
  const handleView = (inmuebleId) => {
    const inmueble = inmuebles.find(i => i.id === inmuebleId);
    if (inmueble) {
      setInmuebleSeleccionado(inmueble);
      setViewModalVisible(true);
    } else {
      message.error("No se encontró el inmueble seleccionado");
    }
  };

  // Acción para editar un inmueble
  const handleEdit = (inmuebleId) => {
    const inmueble = inmuebles.find(i => i.id === inmuebleId);
    if (inmueble) {
      setInmuebleSeleccionado(inmueble);
      
      // Configurar valores iniciales del formulario
      form.setFieldsValue({
        nombre: inmueble.nombre,
        direccion: inmueble.direccion,
        propietario_id: inmueble.propietario_id,
        tipo_inmueble: inmueble.tipo_inmueble,
        cantidad_pisos: inmueble.cantidad_pisos,
        descripcion: inmueble.descripcion || ''
      });
      
      setEditModalVisible(true);
    } else {
      message.error("No se encontró el inmueble seleccionado");
    }
  };

  // Guardar cambios de edición
  const handleSaveEdit = async () => {
    try {
      setLoadingSave(true);
      // Validar formulario
      const values = await form.validateFields();
      
      // Preparar datos para enviar
      const inmuebleData = {
        nombre: values.nombre,
        direccion: values.direccion,
        propietario_id: values.propietario_id,
        tipo_inmueble: values.tipo_inmueble,
        cantidad_pisos: values.cantidad_pisos,
        descripcion: values.descripcion || ''
      };
      
      // Llamar al servicio para actualizar
      await inmuebleService.actualizarInmueble(inmuebleSeleccionado.id, inmuebleData);
      
      // Actualizar la lista
      refreshData();
      
      // Cerrar modal y mostrar mensaje
      setEditModalVisible(false);
      message.success("Inmueble actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar inmueble:", err);
      message.error("Error al guardar cambios: " + (err.message || "Error desconocido"));
    } finally {
      setLoadingSave(false);
    }
  };

  // Acción para eliminar un inmueble
  const handleDelete = async (inmuebleId) => {
    try {
      await inmuebleService.eliminarInmueble(inmuebleId);
      refreshData();
      message.success("Inmueble eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el inmueble:", error);
      message.error("No se pudo eliminar el inmueble");
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Columnas de la tabla
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Propietario",
      dataIndex: "propietario_nombre",
      key: "propietario",
      sorter: (a, b) => {
        if (!a.propietario_nombre || !b.propietario_nombre) return 0;
        return a.propietario_nombre.localeCompare(b.propietario_nombre);
      },
      render: (text) => text || "N/A",
    },
    {
      title: "Inmueble",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => {
        if (!a.nombre || !b.nombre) return 0;
        return a.nombre.localeCompare(b.nombre);
      },
      render: (text) => text || "N/A",
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
      sorter: (a, b) => {
        if (!a.direccion || !b.direccion) return 0;
        return a.direccion.localeCompare(b.direccion);
      },
      render: (text) => text || "N/A",
    },
    {
      title: "Tipo",
      dataIndex: "tipo_inmueble",
      key: "tipo_inmueble",
      sorter: (a, b) => {
        if (!a.tipo_inmueble || !b.tipo_inmueble) return 0;
        return a.tipo_inmueble.localeCompare(b.tipo_inmueble);
      },
      render: (text) => text || "N/A",
    },
    {
      title: "Cantidad de Pisos",
      dataIndex: "cantidad_pisos",
      key: "cantidad_pisos",
      sorter: (a, b) => (a.cantidad_pisos || 0) - (b.cantidad_pisos || 0),
      render: (text) => text || "0",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (text, record) => (
        <div className="text-center">
          {windowWidth > 768 ? (
            <>
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
                title="Editar inmueble"
              >
                <EditOutlined />
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(record.id)}
                title="Eliminar inmueble"
              >
                <DeleteOutlined />
              </button>
            </>
          ) : (
            <div className="dropdown dropdown-action">
              <Link
                to="#"
                className="action-icon dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-ellipsis-v" />
              </Link>
              <div className="dropdown-menu dropdown-menu-end">
                <Link className="dropdown-item" to="#" onClick={() => handleView(record.id)}>
                  <i className="far fa-eye me-2" />
                  Ver
                </Link>
                <Link className="dropdown-item" to="#" onClick={() => handleEdit(record.id)}>
                  <i className="far fa-edit me-2" />
                  Editar
                </Link>
                <Link className="dropdown-item" to="#" onClick={() => handleDelete(record.id)}>
                  <i className="fa fa-trash-alt me-2" />
                  Eliminar
                </Link>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <Sidebar id='menu-item3' id1='menu-items3' activeClassName='inmueble-registros' />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Inmuebles </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FiChevronRight />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Lista de Inmuebles</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  <div className="page-table-header mb-2">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="doctor-table-blk">
                          <h3>Lista de Inmuebles</h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <form>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Buscar por nombre, dirección..."
                                  value={searchText}
                                  onChange={handleSearch}
                                />
                                <button className="btn" type="button">
                                  <img src={searchnormal} alt="Buscar" />
                                </button>
                              </form>
                            </div>
                            <div className="add-group">
                              <Link
                                to="/inmueble-anadir"
                                className="btn btn-primary add-pluss ms-2"
                                title="Añadir inmueble"
                              >
                                <img src={plusicon} alt="Añadir" />
                              </Link>
                              <button
                                className="btn btn-primary doctor-refresh ms-2"
                                onClick={refreshData}
                                title="Actualizar datos"
                              >
                                <img src={refreshicon} alt="Refrescar" />
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
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <div className="table-responsive doctor-list">
                    <Table
                      columns={columns}
                      dataSource={inmueblesFiltrados}
                      rowKey="id"
                      loading={loading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                          `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal para Ver Detalle */}
      <Modal
        title="Detalles del Inmueble"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="cerrar" onClick={() => setViewModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={700}
      >
        {inmuebleSeleccionado && (
          <div className="inmueble-details">
            <div className="row mb-3">
              <div className="col-md-6">
                <h5 className="text-primary">Información General</h5>
                <div className="detail-item">
                  <strong>Nombre:</strong> {inmuebleSeleccionado.nombre}
                </div>
                <div className="detail-item">
                  <strong>Dirección:</strong> {inmuebleSeleccionado.direccion}
                </div>
                <div className="detail-item">
                  <strong>Tipo:</strong> {inmuebleSeleccionado.tipo_inmueble}
                </div>
                <div className="detail-item">
                  <strong>Cantidad de Pisos:</strong> {inmuebleSeleccionado.cantidad_pisos}
                </div>
              </div>
              <div className="col-md-6">
                <h5 className="text-primary">Información del Propietario</h5>
                <div className="detail-item">
                  <strong>Nombre:</strong> {inmuebleSeleccionado.propietario_nombre || 'No disponible'}
                </div>
                <div className="detail-item">
                  <strong>Email:</strong> {inmuebleSeleccionado.propietario_email || 'No disponible'}
                </div>
                <div className="detail-item">
                  <strong>Teléfono:</strong> {inmuebleSeleccionado.propietario_telefono || 'No disponible'}
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-12">
                <h5 className="text-primary">Descripción</h5>
                <div className="card">
                  <div className="card-body">
                    <p>{inmuebleSeleccionado.descripcion || 'Sin descripción disponible'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {inmuebleSeleccionado.pisos && inmuebleSeleccionado.pisos.length > 0 && (
              <div className="row mt-3">
                <div className="col-12">
                  <h5 className="text-primary">Pisos ({inmuebleSeleccionado.pisos.length})</h5>
                  <ul className="list-group">
                    {inmuebleSeleccionado.pisos.map(piso => (
                      <li key={piso.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{piso.nombre || `Piso ${piso.numero}`}</span>
                        <span className="badge bg-primary rounded-pill">
                          {piso.espacios_count || 0} espacios
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      
      {/* Modal para Editar */}
      <Modal
        title="Editar Inmueble"
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
        {inmuebleSeleccionado && (
          <Form
            form={form}
            layout="vertical"
          >
            <div className="row">
              <div className="col-md-6">
                <Form.Item
                  name="nombre"
                  label="Nombre del Inmueble"
                  rules={[{ required: true, message: 'Por favor ingrese el nombre del inmueble' }]}
                >
                  <Input />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="propietario_id"
                  label="Propietario"
                  rules={[{ required: true, message: 'Por favor seleccione un propietario' }]}
                >
                  <Select placeholder="Seleccione un propietario">
                    {propietarios.map(prop => (
                      <Option key={prop.id} value={prop.id}>
                        {`${prop.nombre} ${prop.apellido}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              
              <div className="col-md-12">
                <Form.Item
                  name="direccion"
                  label="Dirección"
                  rules={[{ required: true, message: 'Por favor ingrese la dirección' }]}
                >
                  <Input />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="tipo_inmueble"
                  label="Tipo de Inmueble"
                  rules={[{ required: true, message: 'Por favor seleccione el tipo de inmueble' }]}
                >
                  <Select placeholder="Seleccione el tipo">
                    <Option value="Casa">Casa</Option>
                    <Option value="Departamento">Departamento</Option>
                    <Option value="Oficina">Oficina</Option>
                    <Option value="Local Comercial">Local Comercial</Option>
                    <Option value="Edificio">Edificio</Option>
                    <Option value="Otro">Otro</Option>
                  </Select>
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="cantidad_pisos"
                  label="Cantidad de Pisos"
                  rules={[{ required: true, message: 'Por favor ingrese la cantidad de pisos' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </div>
              
              <div className="col-md-12">
                <Form.Item
                  name="descripcion"
                  label="Descripción"
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

export default InmuebleRegistros;
export default InmuebleRegistros;