import React, { useState, useEffect } from 'react';
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight } from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import inmuebleService from "../../services/inmuebleService";
import espacioService from "../../services/espacioService";
import pisoService from "../../services/pisoService";
import tipoespacioService from "../../services/tipoespacioService";

import '../../assets/styles/form-styles.css';
import '../../assets/styles/table-styles.css';
import '../../assets/styles/EspaciosRegistrar.css';

const EspaciosRegistrar = () => {
  const { user, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState('');
  const [tipoEspacios, setTipoEspacios] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);

  const [formData, setFormData] = useState({
    inmueble_id: '',
    piso_id: '',
    nombre: '',
    tipoEspacio: '',
    descripcion: '',
    precio: '',
    capacidad: '',
    bano: 'propio'
  });

  useEffect(() => {
    if (!estaAutenticado) navigate("/login");

    const fetchData = async () => {
      try {
        const inmueble = await inmuebleService.obtenerInmuebles();
        setInmuebles(inmueble);
        const espacio = await tipoespacioService.obtenerTodos();
        setTipoEspacios(espacio);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response) {
          alert(`Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          alert('Error: No hubo respuesta del servidor.');
        } else {
          alert(`Error: ${error.message}`);
        }
      }
    };

    fetchData();
  }, [estaAutenticado, navigate]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "inmueble_id") {
      setInmuebleSeleccionado(value);
      try {
        const pisos = await pisoService.obtenerPorInmueble(value);
        setPisos(pisos);
      } catch (error) {
        console.error("Error al obtener los pisos:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const espacioData = {
        inmuebleId: formData.inmueble_id,
        pisoId: formData.piso_id,
        nombre: formData.nombre,
        tipoEspacio: formData.tipoEspacio,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        capacidad: parseInt(formData.capacidad),
        bano: formData.bano === 'propio'
      };

      const espacioCreado = await espacioService.crearEspacio(
        formData.inmueble_id,
        formData.piso_id,
        espacioData
      );

      if (!espacioCreado) throw new Error('No se pudo crear el espacio');

      alert('Espacio registrado exitosamente');
      navigate('/espacios');
    } catch (error) {
      console.error('Error al registrar espacio:', error);
      setError(error.message || 'Error al registrar el espacio.');
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
                  <li className="breadcrumb-item"><Link to="#">Espacios</Link></li>
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
                  {error && <div className="alert alert-danger">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12">
                        <h4>Detalles del Espacio</h4>
                      </div>

                      <div className="col-12 col-md-6">
                         <div className="form-group local-forms">  
                        <label>Inmueble *</label>
                        <select
                          name="inmueble_id"
                          value={formData.inmueble_id}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="">Seleccione un inmueble</option>
                          {inmuebles.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                        </select>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                      <div className="form-group local-forms">  
                        <label>Piso *</label>
                        <select
                          name="piso_id"
                          value={formData.piso_id}
                          onChange={handleChange}
                          required
                          disabled={!formData.inmueble_id}
                          className="form-select"
                        >
                          <option value="">Seleccione un piso</option>
                          {pisos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                      </div>
                      </div>
                      <div className="col-12 col-md-6">
                         <div className="form-group local-forms">  
                        <label>Nombre *</label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="form-control"
                        />
                      </div>
                      </div>
                      <div className="col-12 col-md-6">
                      <div className="form-group local-forms">  
                        <label>Tipo de Espacio *</label>
                        <select
                          name="tipoEspacio"
                          value={formData.tipoEspacio}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="">Seleccione tipo</option>
                          {tipoEspacios.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                        </select>
                      </div>
                      </div>
                      <div className="col-12">
                      <div className="form-group local-forms">  
                        <label>Descripción *</label>
                        <textarea
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleChange}
                          required
                          className="form-control"
                          rows={2}
                        />
                        </div>
                      </div>

                      <div className="col-md-6">
                      <div className="form-group local-forms">  
                        <label>Precio *</label>
                        <input
                          type="number"
                          name="precio"
                          value={formData.precio}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="form-control"
                        />
                        </div>
                      </div>

                      <div className="col-md-6">
                      <div className="form-group local-forms">  
                        <label>Capacidad *</label>
                        <input
                          type="number"
                          name="capacidad"
                          value={formData.capacidad}
                          onChange={handleChange}
                          required
                          min="1"
                          className="form-control"
                        />
                        </div>
                      </div>

                      <div className="col-md-6">
                      <div className="form-group local-forms">  
                        <label>Baño *</label>
                        <select
                          name="bano"
                          value={formData.bano}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="propio">Propio</option>
                          <option value="compartido">Compartido</option>
                        </select>
                        </div>
                      </div>

                      <div className="col-12 text-end mt-4">
                        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                          {loading ? 'Registrando...' : 'Guardar'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/espacios')}>Cancelar</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EspaciosRegistrar;
