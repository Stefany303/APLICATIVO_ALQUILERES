import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { DatePicker } from "antd";
import Select from "react-select";
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import '../../assets/styles/Style.css';
import { useAuth } from "../../utils/AuthContext";
import inmuebleService from "../../services/inmuebleService"; // Importa el servicio de inmuebles
import personaService from "../../services/personaService"; // Importa el servicio de personas
import tipoInmuebleService from "../../services/tipoInmuebleService";

const AnadirInmueble = () => {
  const { user, estaAutenticado } = useAuth(); // Obtén el usuario y el estado de autenticación
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([
    { value: 1, label: "Inquilino" },
    { value: 2, label: "Propietario" },
    { value: 3, label: "Administrador" },
  ]);
  const [formData, setFormData] = useState({
    propietario_id: '',
    tipoInmueble_id: '',
    nombre: '',
    descripcion: '',
    direccion: '',
    ubigeo: ''
  });

  const [propietarios, setPropietarios] = useState([]);
  const [tiposInmueble, setTiposInmueble] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verifica si el usuario está autenticado
    if (!estaAutenticado) {
      navigate("/login"); // Redirige al login si no está autenticado
    }

    // Obtener propietarios y tipos de inmueble
    const fetchData = async () => {
      try {
        // Obtener todas las personas
        const personas = await personaService.obtenerPersonas();
        // Filtrar las personas con rol de "propietario"
        const propietariosFiltrados = personas.filter(persona => persona.rol === "propietario");
        setPropietarios(propietariosFiltrados);

        // Obtener tipos de inmueble desde el servicio
        const tiposInmuebleData = await tipoInmuebleService.obtenertipoInmueble();
        setTiposInmueble(tiposInmuebleData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [estaAutenticado, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selected, name) => {
    setFormData({ ...formData, [name]: selected.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Enviar los datos al backend usando el servicio
      const response = await inmuebleService.crearInmueble(formData);

      if (response) {
        alert('Inmueble añadido correctamente');
        setFormData({
          propietario_id: '',
          tipoInmueble_id: '',
          nombre: '',
          descripcion: '',
          direccion: '',
          ubigeo: ''
        });
        navigate("/inmuebles"); // Redirige a la lista de inmuebles
      }
    } catch (error) {
      console.error("Error al añadir el inmueble:", error);
      setError("Error al añadir el inmueble. Inténtalo de nuevo.");
    }
  };

  return (
    <div>
      <Header />
      <Sidebar id="menu-item1" id1="menu-items1" activeClassName="inmueble-anadir" />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Inmueble </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FaChevronRight icon="chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Añadir</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12">
                        <div className="form-heading">
                          <h4>Detalles del Inmueble</h4>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Nombre del Inmueble <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Descripción <span className="login-danger">*</span>
                          </label>
                          <textarea
                            className="form-control"
                            rows={2}
                            cols={30}
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Dirección <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Ubigeo <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="ubigeo"
                            value={formData.ubigeo}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Cantidad de Pisos <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="number"
                            name="cantidad_pisos"
                            value={formData.cantidad_pisos}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Propietario <span className="login-danger">*</span>
                          </label>
                          <Select
                            options={propietarios.map(p => ({ 
                              value: p.id, 
                              label: `${p.nombre} ${p.apellido}` // Mostrar nombre y apellido
                            }))}
                            onChange={(selected) => handleSelectChange(selected, "propietario_id")}
                            placeholder="Selecciona un propietario"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Tipo de Inmueble <span className="login-danger">*</span>
                          </label>
                          <Select
                            options={tiposInmueble.map(t => ({ value: t.id, label: t.nombre }))} 
                            onChange={(selected) => handleSelectChange(selected, "tipoInmueble_id")}
                            placeholder="Selecciona un tipo de inmueble"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="doctor-submit text-end">
                          <button
                            type="submit"
                            className="btn btn-primary submit-form me-2"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary cancel-form"
                            onClick={() => navigate("/inmuebles")}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnadirInmueble;