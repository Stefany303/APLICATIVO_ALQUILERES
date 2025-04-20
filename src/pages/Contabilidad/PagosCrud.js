import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link } from 'react-router-dom';
import { FiChevronRight, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import pagoService from '../../services/pagoService';

const PagosCrud = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const pagosData = await pagoService.obtenerPagos();
        setPagos(pagosData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los pagos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFiltroEstado = (e) => {
    setFiltroEstado(e.target.value);
  };

  const handleFiltroFecha = (e) => {
    setFiltroFecha(e.target.value);
  };

  const handleEliminarPago = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este pago?')) {
      try {
        await pagoService.eliminarPago(id);
        setPagos(pagos.filter(pago => pago.id !== id));
        alert('Pago eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar el pago:', error);
        alert('Error al eliminar el pago');
      }
    }
  };

  const pagosFiltrados = pagos.filter(pago => {
    const cumpleEstado = filtroEstado === 'TODOS' || pago.estado === filtroEstado;
    const cumpleFecha = !filtroFecha || pago.fechaPago.includes(filtroFecha);
    return cumpleEstado && cumpleFecha;
  });

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
                  <li className="breadcrumb-item active">Gestión de Pagos</li>
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
                        <h4>Gestión de Pagos</h4>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-3">
                      <div className="form-group local-forms">
                        <label>Filtrar por Estado</label>
                        <select
                          className="form-control"
                          value={filtroEstado}
                          onChange={handleFiltroEstado}
                        >
                          <option value="TODOS">Todos</option>
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="PAGADO">Pagado</option>
                          <option value="VENCIDO">Vencido</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-3">
                      <div className="form-group local-forms">
                        <label>Filtrar por Fecha</label>
                        <input
                          type="month"
                          className="form-control"
                          value={filtroFecha}
                          onChange={handleFiltroFecha}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Espacio</th>
                          <th>Inquilino</th>
                          <th>Monto</th>
                          <th>Fecha de Pago</th>
                          <th>Método de Pago</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosFiltrados.map((pago) => (
                          <tr key={pago.id}>
                            <td>{pago.id}</td>
                            <td>{pago.espacioNombre}</td>
                            <td>{pago.inquilinoNombre}</td>
                            <td>${pago.monto.toFixed(2)}</td>
                            <td>{pago.fechaPago}</td>
                            <td>{pago.metodoPago}</td>
                            <td>
                              <span className={`badge bg-${pago.estado === 'PAGADO' ? 'success' : pago.estado === 'PENDIENTE' ? 'warning' : 'danger'}`}>
                                {pago.estado}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <Link
                                  to={`/contabilidad/pagos/ver/${pago.id}`}
                                  className="btn btn-sm bg-success-light me-2"
                                >
                                  <FiEye className="feather-eye" />
                                </Link>
                                <Link
                                  to={`/contabilidad/pagos/editar/${pago.id}`}
                                  className="btn btn-sm bg-primary-light me-2"
                                >
                                  <FiEdit2 className="feather-edit" />
                                </Link>
                                <button
                                  className="btn btn-sm bg-danger-light"
                                  onClick={() => handleEliminarPago(pago.id)}
                                >
                                  <FiTrash2 className="feather-trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default PagosCrud;
