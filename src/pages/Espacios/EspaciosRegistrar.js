import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Asegúrate de que axios esté instalado
import '../../assets/styles/form-styles.css'; // Asegúrate de que la ruta sea correcta para tus estilos
import '../../assets/styles/table-styles.css';
import '../../assets/styles/EspaciosRegistrar.css';
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link,useNavigate } from 'react-router-dom';
import { FiChevronRight } from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import inmuebleService from "../../services/inmuebleService";
const EspaciosRegistrar = () => {
   const { user, estaAutenticado } = useAuth(); // Obtén el usuario y el estado de autenticación
    const navigate = useNavigate();
  const [numeroPisos, setNumeroPisos] = useState(0);
  const [pisos, setPisos] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [selectedInmueble, setSelectedInmueble] = useState('');
const [formData, setFormData] = useState({
    inmueble_id: '',
    
  });
  // useEffect(() => {
  //   // Lógica para obtener la lista de inmuebles de tu API
  //   const fetchInmuebles = async () => {
  //     try {
  //       const response = await axios.get('URL_DE_TU_API/inmuebles'); // Cambia esto por tu URL
  //       setInmuebles(response.data);
  //     } catch (error) {
  //       console.error('Error al obtener inmuebles:', error);
  //     }
  //   };
  //   fetchInmuebles();
  // }, []);
  useEffect(() => {
    // Verifica si el usuario está autenticado
    if (!estaAutenticado) {
      navigate("/login"); // Redirige al login si no está autenticado
    }

    // Obtener propietarios y tipos de inmueble
    const fetchData = async () => {
      try {
        // Obtener todas las personas
        const inmueble = await inmuebleService.obtenerInmuebles();
        setInmuebles(inmueble);
 
       
      } catch (error) {
        console.error("Error fetching data:", error);
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

    fetchData();
  }, [estaAutenticado, navigate]);

  const handleNumeroPisosChange = (event) => {
    const newNumeroPisos = event.target.value;
    setNumeroPisos(newNumeroPisos);

    const updatedPisos = Array.from({ length: newNumeroPisos }, (_, i) => ({
      nombre: pisos[i]?.nombre || '',
      espacios: [{ nombre: '', tipoEspacio: '' }],
    }));

    setPisos(updatedPisos);
  };

  const handlePisoChange = (index, event) => {
    const updatedPisos = [...pisos];
    updatedPisos[index].nombre = event.target.value;
    setPisos(updatedPisos);
  };

  const addEspacio = (pisoIndex) => {
    const updatedPisos = [...pisos];
    updatedPisos[pisoIndex].espacios.push({ nombre: '', tipoEspacio: '' });
    setPisos(updatedPisos);
  };

  const handleEspacioChange = (pisoIndex, espacioIndex, event) => {
    const updatedPisos = [...pisos];
    updatedPisos[pisoIndex].espacios[espacioIndex][event.target.name] = event.target.value;
    setPisos(updatedPisos);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí puedes enviar los datos a tu API
    console.log('Datos de inmueble y pisos/espacios:', { selectedInmueble, pisos });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  return (
    <>
    <Header />
    <Sidebar id='menu-item6' id1='menu-items6' activeClassName='espacios-registrar'/>
    <>
      <div>
        <div className="page-wrapper">
          <div className="content">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="#">Espacios</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <i className="feather-chevron-right">
                        <FiChevronRight icon="chevron-right" />
                      </i>
                    </li>
                    <li className="breadcrumb-item active">Registrar</li>
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
                        <h4>Detalles del Espacio</h4>
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <div className="form-group local-forms">
                        <label>Inmueble <span className="login-danger">*</span></label>
                        <select
                          id="inmueble_id"
                          name="inmueble_id"
                          value={formData.inmueble_id}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="">Seleccione un inmueble</option>
                          {inmuebles.map((inmueble) => (
                            <option key={inmueble.id} value={inmueble.id}>{inmueble.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* <div className="col-12 col-md-6">
                      <div className="form-group local-forms">
                        <label>Piso <span className="login-danger">*</span></label>
                        <select
                          id="piso_id"
                          name="piso_id"
                          value={formData.piso_id}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="">Seleccione un piso</option>
                          {pisos.map((piso) => (
                            <option key={piso.id} value={piso.id}>{piso.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div> */}
                    <div className="col-12 col-md-6">
                      <div className="form-group local-forms">
                        <label>Cantidad de Pisos <span className="login-danger">*</span></label>
                        <input
                          type="number"
                          id="numeroPisos"
                          name="numeroPisos"
                          value={numeroPisos}
                          onChange={handleNumeroPisosChange}
                          min="1"
                          required
                          className="form-control"
                          
                        />
                      </div>
                    </div>
                    <div className="espacios-container">
                        <div className="espacios-box">
                        <div className="form-heading">
                        <h4>Registrar el nombre de los espacios</h4>
                      </div>
                          {Array.from({ length: numeroPisos }, (_, pisoIndex) => (
                            <div key={pisoIndex} className="espacio-row">
                              <label className="col-form-label" htmlFor={`piso-${pisoIndex}`}>Nombre del Piso:</label>
                              <input
                                type="text"
                                className="form-control"
                                id={`piso-${pisoIndex}`}
                                value={pisos[pisoIndex]?.nombre}
                                onChange={(event) => handlePisoChange(pisoIndex, event)}
                                required
                              />
                              <button className="btn btn-primary" type="button" onClick={() => addEspacio(pisoIndex)}>
                                Agregar Espacio
                                </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    
                  </div>
                  <div className="col-12">
                      <div className="doctor-submit text-end">
                        <button type="submit" className="btn btn-primary submit-form me-2">Guardar</button>
                        <button type="button" className="btn btn-primary cancel-form">Cancelar</button>
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
      </>
    </>
  );
};

export default EspaciosRegistrar;
