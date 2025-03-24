import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import inmuebleService from "../../services/inmuebleService";
import personaService from "../../services/personaService";
import tipoInmuebleService from "../../services/tipoInmuebleService";

const EditarInmueble = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inmueble = await inmuebleService.obtenerInmueblePorId(id);
        const personas = await personaService.obtenerPersonas();
        const tiposInmuebleData = await tipoInmuebleService.obtenertipoInmueble();

        const propietariosFiltrados = personas.filter(p => p.rol === "propietario");

        setFormData({
          propietario_id: inmueble.propietario_id,
          tipoInmueble_id: inmueble.tipoInmueble_id,
          ...inmueble
        });
        setPropietarios(propietariosFiltrados);
        setTiposInmueble(tiposInmuebleData);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selected, name) => {
    setFormData({ ...formData, [name]: selected.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos enviados:", formData);
    const camposValidos = ['propietario_id', 'tipoInmueble_id', 'nombre', 'descripcion', 'direccion', 'ubigeo'];
  
    const datosFiltrados = Object.fromEntries(
      Object.entries(formData).filter(([key]) => camposValidos.includes(key))
    );
  
    console.log("Datos enviados:", datosFiltrados);
    try {
      await inmuebleService.actualizarInmueble(id, datosFiltrados);
      alert('Inmueble actualizado correctamente');
      navigate("/inmueble-registros");
    } catch (error) {
      console.error("Error updating inmueble:", error);
      alert('Error al actualizar el inmueble');
       // Verificar si hay una respuesta del servidor
          if (error.response) {
            console.error('Código de estado:', error.response.status);
            console.error('Mensaje de error:', error.response.data);
            alert(`Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
          } else if (error.request) {
            console.error('No hubo respuesta del servidor:', error.request);
            alert('Error: No hubo respuesta del servidor.');
          } else {
            console.error('Error en la configuración de la solicitud:', error.message);
            alert(`Error: ${error.message}`);
          }
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <Header />
      <Sidebar id="menu-item1" id1="menu-items1" activeClassName="inmueble-editar" />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    {/* <Link to="#">Inmueble</Link> */}
                  </li>
                  <li className="breadcrumb-item active">Editar</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12">
                        <div className="form-heading">
                          <h4>Editar Inmueble</h4>
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>Nombre del Inmueble</label>
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
                          <label>Descripción</label>
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
                          <label>Dirección</label>
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
                          <label>Ubigeo</label>
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
                          <label>Propietario</label>
                          <Select
                            options={propietarios.map(p => ({ 
                              value: p.id, 
                              label: `${p.nombre} ${p.apellido}` 
                            }))}
                            value={propietarios
                              .map(p => ({ 
                                value: p.id, 
                                label: `${p.nombre} ${p.apellido}` 
                              }))
                              .find(p => p.value === formData.propietario_id)}
                            onChange={(selected) => handleSelectChange(selected, "propietario_id")}
                            placeholder="Selecciona un propietario"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>Tipo de Inmueble</label>
                          <Select
                            options={tiposInmueble.map(t => ({ value: t.id, label: t.nombre }))}
                            value={tiposInmueble
                              .map(t => ({ value: t.id, label: t.nombre }))
                              .find(t => t.value === formData.tipoInmueble_id)}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarInmueble;