import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link } from 'react-router-dom';
import { FiChevronRight, FiEdit2, FiTrash2, FiEye, FiSearch, FiFileText, FiPlus } from "react-icons/fi";
import inquilinoService from '../../services/inquilinoService';
import contratoService from '../../services/contratoService';
import { Modal, Button, Form } from 'react-bootstrap';

const Inquilinos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquilinos, setInquilinos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [showModalContrato, setShowModalContrato] = useState(false);
  const [selectedInquilino, setSelectedInquilino] = useState(null);
  const [espaciosDisponibles, setEspaciosDisponibles] = useState([]);
  const [formData, setFormData] = useState({
    espacioId: '',
    fechaInicio: '',
    fechaFin: '',
    montoMensual: '',
    deposito: '',
    observaciones: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inquilinosData, espaciosData] = await Promise.all([
          inquilinoService.obtenerInquilinos(),
          contratoService.obtenerEspaciosDisponibles()
        ]);
        setInquilinos(inquilinosData);
        setEspaciosDisponibles(espaciosData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFiltroNombre = (e) => {
    setFiltroNombre(e.target.value);
  };

  const handleFiltroEstado = (e) => {
    setFiltroEstado(e.target.value);
  };

  const handleEliminarInquilino = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este inquilino?')) {
      try {
        await inquilinoService.eliminarInquilino(id);
        setInquilinos(inquilinos.filter(inquilino => inquilino.id !== id));
        alert('Inquilino eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar el inquilino:', error);
        alert('Error al eliminar el inquilino');
      }
    }
  };

  const handleAbrirModalContrato = (inquilino) => {
    setSelectedInquilino(inquilino);
    setShowModalContrato(true);
  };

  const handleCerrarModalContrato = () => {
    setShowModalContrato(false);
    setSelectedInquilino(null);
    setFormData({
      espacioId: '',
      fechaInicio: '',
      fechaFin: '',
      montoMensual: '',
      deposito: '',
      observaciones: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContrato = async (e) => {
    e.preventDefault();
    try {
      const contratoData = {
        ...formData,
        inquilinoId: selectedInquilino.id
      };
      await contratoService.crearContrato(contratoData);
      alert('Contrato creado exitosamente');
      handleCerrarModalContrato();
    } catch (error) {
      console.error('Error al crear el contrato:', error);
      alert('Error al crear el contrato');
    }
  };

  const inquilinosFiltrados = inquilinos.filter(inquilino => {
    const cumpleNombre = !filtroNombre || 
      inquilino.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) ||
      inquilino.apellido.toLowerCase().includes(filtroNombre.toLowerCase());
    const cumpleEstado = filtroEstado === 'TODOS' || inquilino.estado === filtroEstado;
    return cumpleNombre && cumpleEstado;
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
      <Sidebar id='menu-item3' id1='menu-items3' activeClassName='inquilinos'/>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Inquilinos</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FiChevronRight icon="chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Gestión de Inquilinos</li>
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
                        <h4>Gestión de Inquilinos</h4>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-4">
                      <div className="form-group local-forms">
                        <label>Buscar por Nombre</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar inquilino..."
                            value={filtroNombre}
                            onChange={handleFiltroNombre}
                          />
                          <span className="input-group-text">
                            <FiSearch />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-4">
                      <div className="form-group local-forms">
                        <label>Filtrar por Estado</label>
                        <select
                          className="form-control"
                          value={filtroEstado}
                          onChange={handleFiltroEstado}
                        >
                          <option value="TODOS">Todos</option>
                          <option value="ACTIVO">Activo</option>
                          <option value="INACTIVO">Inactivo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Teléfono</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquilinosFiltrados.map((inquilino) => (
                          <tr key={inquilino.id}>
                            <td>{inquilino.id}</td>
                            <td>{`${inquilino.nombre} ${inquilino.apellido}`}</td>
                            <td>{inquilino.email}</td>
                            <td>{inquilino.telefono}</td>
                            <td>
                              <span className={`badge bg-${inquilino.estado === 'ACTIVO' ? 'success' : 'danger'}`}>
                                {inquilino.estado}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <Link
                                  to={`/inquilinos/ver/${inquilino.id}`}
                                  className="btn btn-sm bg-success-light me-2"
                                >
                                  <FiEye className="feather-eye" />
                                </Link>
                                <Link
                                  to={`/inquilinos/editar/${inquilino.id}`}
                                  className="btn btn-sm bg-primary-light me-2"
                                >
                                  <FiEdit2 className="feather-edit" />
                                </Link>
                                <button
                                  className="btn btn-sm bg-info-light me-2"
                                  onClick={() => handleAbrirModalContrato(inquilino)}
                                >
                                  <FiFileText className="feather-file-text" />
                                </button>
                                <button
                                  className="btn btn-sm bg-danger-light"
                                  onClick={() => handleEliminarInquilino(inquilino.id)}
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

      {/* Modal para crear contrato */}
      <Modal show={showModalContrato} onHide={handleCerrarModalContrato} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Contrato</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInquilino && (
            <Form onSubmit={handleSubmitContrato}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Inquilino</Form.Label>
                    <Form.Control
                      type="text"
                      value={`${selectedInquilino.nombre} ${selectedInquilino.apellido}`}
                      disabled
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Espacio</Form.Label>
                    <Form.Select
                      name="espacioId"
                      value={formData.espacioId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar espacio</option>
                      {espaciosDisponibles.map(espacio => (
                        <option key={espacio.id} value={espacio.id}>
                          {espacio.nombre} - {espacio.tipo}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Inicio</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Fin</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Monto Mensual</Form.Label>
                    <Form.Control
                      type="number"
                      name="montoMensual"
                      value={formData.montoMensual}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Depósito</Form.Label>
                    <Form.Control
                      type="number"
                      name="deposito"
                      value={formData.deposito}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-12">
                  <Form.Group className="mb-3">
                    <Form.Label>Observaciones</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="text-end">
                <Button variant="secondary" onClick={handleCerrarModalContrato} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Crear Contrato
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Inquilinos; 