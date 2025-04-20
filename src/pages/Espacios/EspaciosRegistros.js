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
import '../../assets/styles/form-styles.css';
import '../../assets/styles/EspaciosRegistrar.css';
import { message, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';

const EspaciosRegistros = () => {
  const { user, estaAutenticado } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [espacios, setEspacios] = useState([]);
  const [espaciosFiltrados, setEspaciosFiltrados] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [selectedInmueble, setSelectedInmueble] = useState('');
  const [selectedPiso, setSelectedPiso] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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

  // Cargar inmuebles y espacios al montar el componente
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoading(true);
      setError(null);
      try {
        // Cargar inmuebles
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        console.log('Inmuebles cargados:', inmueblesData);
        setInmuebles(inmueblesData);

        // Cargar todos los espacios
        const espaciosData = await espacioService.obtenerEspacios();
        console.log('Todos los espacios cargados:', espaciosData);
        setEspacios(espaciosData);
        setEspaciosFiltrados(espaciosData); // Inicialmente mostrar todos los espacios
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Cargar pisos cuando se selecciona un inmueble
  useEffect(() => {
    const cargarPisos = async () => {
      if (!selectedInmueble) {
        setPisos([]);
        setEspaciosFiltrados(espacios); // Mostrar todos los espacios si no hay inmueble seleccionado
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('Cargando pisos para inmueble:', selectedInmueble);
        const data = await inmuebleService.obtenerEspaciosPorInmueble(selectedInmueble);
        console.log('Pisos cargados:', data);
        setPisos(data);
        setSelectedPiso('');

        // Filtrar espacios por los pisos del inmueble
        const pisosDelInmueble = data.map(piso => piso.id);
        const filtrados = espacios.filter(espacio => 
          pisosDelInmueble.includes(espacio.piso_id)
        );
        console.log('Espacios filtrados por inmueble:', filtrados);
        setEspaciosFiltrados(filtrados);
      } catch (error) {
        console.error('Error al cargar pisos:', error);
        setError('Error al cargar los pisos');
        setPisos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarPisos();
  }, [selectedInmueble, espacios]);

  // Filtrar espacios cuando se selecciona un piso
  useEffect(() => {
    if (!selectedPiso) {
      // Si no hay piso seleccionado, mostrar los espacios filtrados por inmueble
      const pisosDelInmueble = pisos.map(piso => piso.id);
      const filtrados = espacios.filter(espacio => 
        !selectedInmueble || pisosDelInmueble.includes(espacio.piso_id)
      );
      setEspaciosFiltrados(filtrados);
      return;
    }

    // Filtrar por piso específico
    const filtrados = espacios.filter(espacio => 
      espacio.piso_id === parseInt(selectedPiso)
    );
    console.log('Espacios filtrados por piso:', filtrados);
    setEspaciosFiltrados(filtrados);
  }, [selectedPiso, espacios, pisos, selectedInmueble]);

  const handleInmuebleChange = (e) => {
    console.log('Inmueble seleccionado:', e.target.value);
    setSelectedInmueble(e.target.value);
  };

  const handlePisoChange = (e) => {
    console.log('Piso seleccionado:', e.target.value);
    setSelectedPiso(e.target.value);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleExport = () => {
    // Implementar lógica de exportación
    message.success('Exportación iniciada');
  };

  const handleEdit = (record) => {
    navigate(`/espacios/editar/${record.id}`);
  };

  const handleDelete = async (record) => {
    try {
      await espacioService.eliminarEspacio(record.id);
      message.success('Espacio eliminado correctamente');
      // Recargar espacios
      if (selectedPiso) {
        const data = await espacioService.obtenerEspaciosPorPiso(selectedPiso);
        setEspacios(data);
      }
    } catch (error) {
      message.error('Error al eliminar el espacio');
    }
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
      dataIndex: "tipoEspacio_id",
      key: "tipoEspacio_id",
      sorter: (a, b) => a.tipoEspacio_id - b.tipoEspacio_id,
      render: (tipo) => {
        const tipos = {
          1: "Oficina",
          2: "Local",
          3: "Depósito"
        };
        return tipos[tipo] || "Desconocido";
      }
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
      sorter: (a, b) => a.precio - b.precio,
      render: (precio) => `S/ ${precio.toFixed(2)}`
    },
    {
      title: "Capacidad",
      dataIndex: "capacidad",
      key: "capacidad",
      sorter: (a, b) => a.capacidad - b.capacidad,
    },
    {
      title: "Baño",
      dataIndex: "bano",
      key: "bano",
      render: (bano) => bano ? "Propio" : "Compartido"
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => estado
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div className="text-end">
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
              <Link className="dropdown-item" to={`/espacios/editar/${record.id}`}>
                <i className="far fa-edit me-2" />
                Editar
              </Link>
              <Link 
                className="dropdown-item" 
                to="#" 
                onClick={() => handleDelete(record)}
              >
                <i className="fa fa-trash-alt me-2" />
                Eliminar
              </Link>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredData = espaciosFiltrados.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

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
                              <Link className="btn">
                                <img src={searchnormal} alt="#" />
                              </Link>
                            </form>
                          </div>
                          <div className="add-group">
                            <Link
                              to="/espacios/registrar"
                              className="btn btn-primary add-pluss ms-2"
                            >
                              <img src={plusicon} alt="#" />
                            </Link>
                            <Link
                              to="#"
                              className="btn btn-primary doctor-refresh ms-2"
                              onClick={() => window.location.reload()}
                            >
                              <img src={refreshicon} alt="#" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-auto text-end float-end ms-auto download-grp">
                      <Link to="#" className="me-2">
                        <img src={pdficon} alt="#" />
                      </Link>
                      <Link to="#" className="me-2">
                        <img src={pdficon3} alt="#" />
                      </Link>
                      <Link to="#" className="me-2">
                        <img src={pdficon4} alt="#" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="staff-search-table">
                  <form>
                    <div className="row">
                      <div className="col-12 col-md-6 col-xl-4">
                        <div className="form-group local-forms">
                          <label>Seleccionar Inmueble</label>
                          <select
                            className="form-control"
                            value={selectedInmueble}
                            onChange={handleInmuebleChange}
                          >
                            <option value="">Seleccionar inmueble</option>
                            {inmuebles.map(inmueble => (
                              <option key={inmueble.id} value={inmueble.id}>
                                {inmueble.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-4">
                        <div className="form-group local-forms">
                          <label>Seleccionar Piso</label>
                          <select
                            className="form-control"
                            value={selectedPiso}
                            onChange={handlePisoChange}
                            disabled={!selectedInmueble}
                          >
                            <option value="">Seleccionar piso</option>
                            {pisos.map(piso => (
                              <option key={piso.id} value={piso.id}>
                                Piso {piso.numero}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="table-responsive doctor-list">
                  <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    rowSelection={rowSelection}
                    pagination={{
                      total: espaciosFiltrados.length,
                      showTotal: (total, range) =>
                        `Mostrando ${range[0]} de ${range[1]} de ${total} registros`,
                      onShowSizeChange: onShowSizeChange,
                      itemRender: itemRender,
                    }}
                    style={{
                      backgroundColor: '#f2f2f2',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default EspaciosRegistros;
