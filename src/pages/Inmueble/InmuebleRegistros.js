import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from "react-icons/fi";
import { Table } from 'antd';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { plusicon, refreshicon, searchnormal, pdficon, pdficon3, pdficon4 } from '../../components/imagepath';
import contratoService from '../../services/contratoService';
import inmuebleService from '../../services/inmuebleService';
const InmuebleRegistros = () => {
  const [inmuebles, setInmuebles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Actualizar el ancho de la ventana al cambiar el tamaño
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Obtener los inmuebles al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await inmuebleService.obtenerInmuebles();
        console.log('Respuesta del backend:', response);
        
        // Verificar el tipo de respuesta
        console.log('Tipo de respuesta:', typeof response);
        console.log('¿Es array?', Array.isArray(response));
        
        // Asegurarnos de que los datos sean un array
        const inmueblesArray = Array.isArray(response) ? response : [response];
        console.log('Datos procesados para la tabla:', inmueblesArray);
        
        setInmuebles(inmueblesArray);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        console.error("Detalles del error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } finally {
        setLoading(false);
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
      await contratoService.eliminarContrato(inmuebleId);
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
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Propietario",
      dataIndex: "propietario_nombre",
      key: "propietario",
      sorter: (a, b) => a.propietario_nombre.localeCompare(b.propietario_nombre),
    },
    {
      title: "Inmueble",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
      sorter: (a, b) => a.direccion.localeCompare(b.direccion),
    },
    {
      title: "Tipo",
      dataIndex: "tipo_inmueble",
      key: "tipo_inmueble",
      sorter: (a, b) => a.tipo_inmueble.localeCompare(b.tipo_inmueble),
    },
    {
      title: "Cantidad de Pisos",
      dataIndex: "cantidad_pisos",
      key: "cantidad_pisos",
      sorter: (a, b) => a.cantidad_pisos - b.cantidad_pisos,
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
              >
                <i className="far fa-eye me-2" />
              </button>
              <button
                className="btn btn-sm btn-warning me-2"
                onClick={() => handleEdit(record.id)}
              >
                <i className="far fa-edit me-2" />
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(record.id)}
              >
                <i className="fa fa-trash-alt me-2" />
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
                  <div className="table-responsive doctor-list">
                    <Table
                      columns={columns}
                      dataSource={Array.isArray(inmuebles) ? inmuebles : []}
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
    </>
  );
};

export default InmuebleRegistros;