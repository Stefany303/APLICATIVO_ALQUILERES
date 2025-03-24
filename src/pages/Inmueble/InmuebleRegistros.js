import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from "react-icons/fi";
import { Table } from 'antd';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { plusicon, refreshicon, searchnormal, pdficon, pdficon3, pdficon4 } from '../../components/imagepath';
import inmuebleService from '../../services/inmuebleService';
import personaService from '../../services/personaService';

const InmuebleRegistros = () => {
  const [inmuebles, setInmuebles] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Actualizar el ancho de la ventana al cambiar el tamaño
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Obtener los inmuebles y los propietarios al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        const personasData = await personaService.obtenerPersonas();
        const propietariosData = personasData.filter(persona => persona.rol === 'propietario');
        setPropietarios(propietariosData);

        const inmueblesConPropietarios = inmueblesData.map(inmueble => {
          const propietario = propietariosData.find(p => p.id === inmueble.propietario_id);
          return {
            ...inmueble,
            propietario: propietario ? `${propietario.nombre} ${propietario.apellido}` : 'Desconocido',
          };
        });

        setInmuebles(inmueblesConPropietarios);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, []);

  // Acción para ver detalles de un inmueble
  const handleView = (inmuebleId) => {
    navigate(`/inmuebles/ver/${inmuebleId}`);
  };

  // Acción para editar un inmueble
  const handleEdit = (inmuebleId) => {
    navigate(`/inmuebles/editar/${inmuebleId}`);
  };

  // Acción para eliminar un inmueble
  const handleDelete = async (inmuebleId) => {
    try {
      await inmuebleService.eliminarInmueble(inmuebleId);
      setInmuebles(inmuebles.filter(inmueble => inmueble.id !== inmuebleId));
      console.log("Inmueble eliminado con ID:", inmuebleId);
    } catch (error) {
      console.error("Error al eliminar el inmueble:", error);
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Propietario",
      dataIndex: "propietario",
      sorter: (a, b) => a.propietario.localeCompare(b.propietario),
    },
    {
      title: "Nombre Inmueble",
      dataIndex: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      sorter: (a, b) => a.direccion.localeCompare(b.direccion),
    },
    {
      title: "Ubigeo",
      dataIndex: "ubigeo",
      sorter: (a, b) => a.ubigeo.localeCompare(b.ubigeo),
    },
    {
      title: "Acciones",
      dataIndex: "acciones",
      render: (text, record) => (
        <div className="text-center">
          {windowWidth > 768 ? (
            // Mostrar botones visibles en pantallas grandes
            <>
              <button
                className="btn btn-sm btn-primary me-2"
                onClick={() => handleView(record.id)}
              >
                <i className="far fa-eye me-2" />
                {/* Ver */}
              </button>
              <button
                className="btn btn-sm btn-warning me-2"
                onClick={() => handleEdit(record.id)}
              >
                <i className="far fa-edit me-2" />
                {/* Editar */}
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(record.id)}
              >
                <i className="fa fa-trash-alt me-2" />
                {/* Eliminar */}
              </button>
            </>
          ) : (
            // Mostrar menú desplegable en pantallas pequeñas
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
          {/* Page Header */}
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
                          <h3>Lista de Inmuebles</h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <form>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Buscar aquí"
                                />
                                <Link className="btn">
                                  <img src={searchnormal} alt="#" />
                                </Link>
                              </form>
                            </div>
                            <div className="add-group">
                              <Link
                                to="/añadir-inmueble"
                                className="btn btn-primary add-pluss ms-2"
                              >
                                <img src={plusicon} alt="#" />
                              </Link>
                              <Link
                                to="#"
                                className="btn btn-primary doctor-refresh ms-2"
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
                        <Link to="#">
                          <img src={pdficon4} alt="#" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* /Table Header */}
                  <div className="table-responsive doctor-list">
                    <Table
                      pagination={{
                        total: inmuebles.length,
                        showTotal: (total, range) =>
                          `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
                      }}
                      columns={columns}
                      dataSource={inmuebles}
                      rowKey={(record) => record.id}
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

export default InmuebleRegistros;