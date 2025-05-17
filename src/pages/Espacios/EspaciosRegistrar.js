import React, { useState, useEffect, useCallback } from 'react';
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import inmuebleService from "../../services/inmuebleService";
import espacioService from "../../services/espacioService";
import pisoService from "../../services/pisoService";
import tipoespacioService from "../../services/tipoespacioService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../../assets/styles/form-styles.css';
import '../../assets/styles/table-styles.css';
import '../../assets/styles/EspaciosRegistrar.css';

const INITIAL_FORM_STATE = {
  inmueble_id: '',
  piso_id: '',
  nombre: '',
  tipoEspacio: '',
  descripcion: '',
  precio: '',
  capacidad: '',
  bano: ''
};

const EspaciosRegistrar = () => {
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tipoEspacios, setTipoEspacios] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Validación del formulario
  const validateForm = () => {
    const errors = [];
    if (!formData.inmueble_id) errors.push('Debe seleccionar un inmueble');
    if (!formData.piso_id) errors.push('Debe seleccionar un piso');
    if (!formData.nombre?.trim()) errors.push('El nombre es requerido');
    if (!formData.tipoEspacio) errors.push('Debe seleccionar un tipo de espacio');
    if (!formData.descripcion?.trim()) errors.push('La descripción es requerida');
    if (!formData.precio || formData.precio <= 0) errors.push('El precio debe ser mayor a 0');
    if (!formData.capacidad || formData.capacidad < 1) errors.push('La capacidad debe ser al menos 1');
    if (!formData.bano) errors.push('Debe seleccionar el tipo de baño');
    return errors;
  };

  // Cargar datos iniciales
  const fetchInitialData = useCallback(async () => {
    try {
      const [inmuebleData, espacioData] = await Promise.all([
        inmuebleService.obtenerInmuebles(),
        tipoespacioService.obtenerTodos()
      ]);
      setInmuebles(inmuebleData);
      setTipoEspacios(espacioData);
    } catch (error) {
      handleError(error, 'Error al cargar los datos iniciales');
    }
  }, []);

  useEffect(() => {
    if (!estaAutenticado) {
      navigate("/login");
      return;
    }
    fetchInitialData();
  }, [estaAutenticado, navigate, fetchInitialData]);

  // Manejo de errores centralizado
  const handleError = (error, message = 'Ha ocurrido un error') => {
    console.error(message, error);
    const errorMessage = error.response?.data?.message || error.message || message;
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "inmueble_id") {
      setFormData(prev => ({ ...prev, piso_id: '' })); // Reset piso when inmueble changes
      try {
        const pisos = await pisoService.obtenerPorInmueble(value);
        setPisos(pisos);
      } catch (error) {
        handleError(error, 'Error al obtener los pisos');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      setLoading(false);
      return;
    }

    try {
      const espacioData = {
        inmueble_id: formData.inmueble_id,
        piso_id: formData.piso_id,
        nombre: formData.nombre.trim(),
        tipoEspacio_id: tipoEspacios.find(t => t.nombre === formData.tipoEspacio)?.id,
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        capacidad: parseInt(formData.capacidad),
        bano: formData.bano === 'propio'
      };

      const espacioCreado = await espacioService.crearEspacio(espacioData);

      if (!espacioCreado) throw new Error('No se pudo crear el espacio');

      toast.success('Espacio registrado exitosamente');
      navigate('/espacios-registros');
    } catch (error) {
      handleError(error, 'Error al registrar el espacio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Sidebar id='menu-item6' id1='menu-items6' activeClassName='espacios-registrar'/>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/espacios">Espacios</Link></li>
                  <li className="breadcrumb-item"><FiChevronRight /></li>
                  <li className="breadcrumb-item active">Registrar</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row">
                      <div className="col-12">
                        <h4 className="mb-4">Detalles del Espacio</h4>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="inmueble_id">Inmueble *</label>
                          <select
                            id="inmueble_id"
                            name="inmueble_id"
                            value={formData.inmueble_id}
                            onChange={handleChange}
                            required
                            className="form-select"
                            aria-describedby="inmuebleHelp"
                          >
                            <option value="">Seleccione un inmueble</option>
                            {inmuebles.map(i => (
                              <option key={i.id} value={i.id}>{i.nombre}</option>
                            ))}
                          </select>
                          <small id="inmuebleHelp" className="form-text text-muted">
                            Seleccione el inmueble donde se encuentra el espacio
                          </small>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="piso_id">Piso *</label>
                          <select
                            id="piso_id"
                            name="piso_id"
                            value={formData.piso_id}
                            onChange={handleChange}
                            required
                            disabled={!formData.inmueble_id}
                            className="form-select"
                            aria-describedby="pisoHelp"
                          >
                            <option value="">Seleccione un piso</option>
                            {pisos.map(p => (
                              <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                          </select>
                          <small id="pisoHelp" className="form-text text-muted">
                            {!formData.inmueble_id ? 'Primero seleccione un inmueble' : 'Seleccione el piso del espacio'}
                          </small>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="nombre">Nombre *</label>
                          <input
                            id="nombre"
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="form-control"
                            placeholder="Ingrese el nombre del espacio"
                            maxLength={100}
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="tipoEspacio">Tipo de Espacio *</label>
                          <select
                            id="tipoEspacio"
                            name="tipoEspacio"
                            value={formData.tipoEspacio}
                            onChange={handleChange}
                            required
                            className="form-select"
                          >
                            <option value="">Seleccione tipo</option>
                            {tipoEspacios.map(t => (
                              <option key={t.id} value={t.nombre}>{t.nombre}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-group local-forms">  
                          <label htmlFor="descripcion">Descripción *</label>
                          <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                            className="form-control"
                            rows={3}
                            placeholder="Describa las características del espacio"
                            maxLength={500}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="precio">Precio *</label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                              id="precio"
                              type="number"
                              name="precio"
                              value={formData.precio}
                              onChange={handleChange}
                              required
                              min="0"
                              step="0.01"
                              className="form-control"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="capacidad">Capacidad *</label>
                          <input
                            id="capacidad"
                            type="number"
                            name="capacidad"
                            value={formData.capacidad}
                            onChange={handleChange}
                            required
                            min="1"
                            className="form-control"
                            placeholder="Número de personas"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group local-forms">  
                          <label htmlFor="bano">Baño *</label>
                          <select
                            id="bano"
                            name="bano"
                            value={formData.bano}
                            onChange={handleChange}
                            required
                            className="form-select"
                          >
                            <option value="">Seleccione tipo de baño</option>
                            <option value="propio">Propio</option>
                            <option value="compartido">Compartido</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-12 text-end mt-4">
                        <button 
                          type="button" 
                          className="btn btn-secondary me-2" 
                          onClick={() => navigate('/espacios')}
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Registrando...
                            </>
                          ) : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default EspaciosRegistrar;
