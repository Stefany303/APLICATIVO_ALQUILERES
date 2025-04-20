import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link } from 'react-router-dom';
import { FiChevronRight, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import gastoService from '../../services/gastoService';

const GastosCrud = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const gastosData = await gastoService.obtenerGastos();
        setGastos(gastosData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los gastos');
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

  const handleFiltroCategoria = (e) => {
    setFiltroCategoria(e.target.value);
  };

  const handleEliminarGasto = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este gasto?')) {
      try {
        await gastoService.eliminarGasto(id);
        setGastos(gastos.filter(gasto => gasto.id !== id));
        alert('Gasto eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar el gasto:', error);
        alert('Error al eliminar el gasto');
      }
    }
  };

  const categoriasGasto = [
    'TODAS',
    'MANTENIMIENTO',
    'SERVICIOS',
    'REPARACIONES',
    'LIMPIEZA',
    'SEGURIDAD',
    'ADMINISTRATIVO',
    'OTROS'
  ];

  const gastosFiltrados = gastos.filter(gasto => {
    const cumpleEstado = filtroEstado === 'TODOS' || gasto.estado === filtroEstado;
    const cumpleFecha = !filtroFecha || gasto.fechaGasto.includes(filtroFecha);
    const cumpleCategoria = filtroCategoria === 'TODAS' || gasto.categoria === filtroCategoria;
    return cumpleEstado && cumpleFecha && cumpleCategoria;
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
      <Sidebar id='menu-item6' id1='menu-items6' activeClassName='contabilidad-gastos'/>
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
                  <li className="breadcrumb-item active">Gestión de Gastos</li>
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
                        <h4>Gestión de Gastos</h4>
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
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-3">
                      <div className="form-group local-forms">
                        <label>Filtrar por Categoría</label>
                        <select
                          className="form-control"
                          value={filtroCategoria}
                          onChange={handleFiltroCategoria}
                        >
                          {categoriasGasto.map(categoria => (
                            <option key={categoria} value={categoria}>
                              {categoria === 'TODAS' ? 'Todas' : categoria}
                            </option>
                          ))}
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
                          <th>Inmueble</th>
                          <th>Concepto</th>
                          <th>Monto</th>
                          <th>Fecha del Gasto</th>
                          <th>Categoría</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gastosFiltrados.map((gasto) => (
                          <tr key={gasto.id}>
                            <td>{gasto.id}</td>
                            <td>{gasto.inmuebleNombre}</td>
                            <td>{gasto.concepto}</td>
                            <td>${gasto.monto.toFixed(2)}</td>
                            <td>{gasto.fechaGasto}</td>
                            <td>{gasto.categoria}</td>
                            <td>
                              <span className={`badge bg-${gasto.estado === 'PAGADO' ? 'success' : gasto.estado === 'PENDIENTE' ? 'warning' : 'danger'}`}>
                                {gasto.estado}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <Link
                                  to={`/contabilidad/gastos/ver/${gasto.id}`}
                                  className="btn btn-sm bg-success-light me-2"
                                >
                                  <FiEye className="feather-eye" />
                                </Link>
                                <Link
                                  to={`/contabilidad/gastos/editar/${gasto.id}`}
                                  className="btn btn-sm bg-primary-light me-2"
                                >
                                  <FiEdit2 className="feather-edit" />
                                </Link>
                                <button
                                  className="btn btn-sm bg-danger-light"
                                  onClick={() => handleEliminarGasto(gasto.id)}
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

export default GastosCrud;
