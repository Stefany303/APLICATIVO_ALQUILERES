import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Asegúrate de que axios esté instalado
import { Link,useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import inmuebleService from "../../services/inmuebleService";
import tipoespacioService from "../../services/tipoespacioService";
import { useAuth } from "../../utils/AuthContext";
import espacioService from '../../services/espacioService';
import pisoService from '../../services/pisoService';
const EspaciosAnadir = () => {
  const { user, estaAutenticado } = useAuth(); // Obtén el usuario y el estado de autenticación
  const navigate = useNavigate();
  const [inmuebles, setInmuebles] = useState([]); // Almacena la lista de inmuebles
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);
  const [pisos, setPisos] = useState([]); // Almacena la lista de pisos
  const [tipoEspacios, setTipoEspacios] = useState([]); // Almacena la lista de tipos de espacios
  const [formData, setFormData] = useState({
    inmueble_id: '',
    piso_id: '',
    tipoEspacio_id: '',
    nombre: '',
    descripcion: '',
    precio: '',
    capacidad: '',
    baño: 'propio', // valor predeterminado
  });


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
        const espacio= await tipoespacioService.obtenerTodos();
        setTipoEspacios(espacio);
       
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

  useEffect(() => {
    if (inmuebleSeleccionado) {
      const obtenerPisos = async () => {
        try {
          const pisos = await pisoService.obtenerPorInmueble(inmuebleSeleccionado);
          setPisos(pisos);
          console.log(pisos);
        } catch (error) {
          console.error("Error al obtener los pisos:", error);
        }
      };
      obtenerPisos();
    }
  }, [inmuebleSeleccionado]);
  // const handleInmuebleChange = (e) => {
  //   const inmuebleId = e.target.value;
  //   setInmuebleSeleccionado(inmuebleId);
  
  //   // Buscar el inmueble seleccionado
  //   const inmueble = inmuebles.find((i) => i.id === parseInt(inmuebleId));
  
  //   // Si lo encuentra, genera los pisos dinámicamente
  //   if (inmueble) {
  //     const nuevosPisos = Array.from({ length: inmueble.cantidad_pisos }, (_, index) => ({
  //       id: index + 1,
  //       nombre: `Piso ${index + 1}`,
  //     }));
  //     setPisos(nuevosPisos);
  //   } else {
  //     setPisos([]); // Si no hay selección, limpia los pisos
  //   }
  // };
  
  // useEffect(() => {
  //   // Obtener todos los inmuebles al montar el componente
  //   const fetchInmuebles = async () => {
  //     try {
  //       const response =  await inmuebleService.obtenerInmuebles(); // Cambia esto por la URL de tu API
  //       setInmuebles(response.data);
  //     } catch (error) {
  //       console.error("Error al obtener los datos de inmuebles:", error);
  //     }
  //   };

  //   const fetchTipoEspacios = async () => {
  //     try {
  //       const response = await axios.get('URL_DE_TU_API/tipoEspacios'); // Cambia esto por la URL de tu API
  //       setTipoEspacios(response.data);
  //     } catch (error) {
  //       console.error("Error al obtener los datos de tipo de espacios:", error);
  //     }
  //   };

  //   fetchInmuebles();
  //   fetchTipoEspacios();
  // }, []);

  // // Efecto para obtener pisos solo cuando se selecciona un inmueble
  // useEffect(() => {
  //   const fetchPisos = async () => {
  //     if (formData.inmueble_id) {
  //       try {
  //         const response = await axios.get(`URL_DE_TU_API/pisos?inmueble_id=${formData.inmueble_id}`); // Cambia esto por la URL de tu API
  //         setPisos(response.data);
  //       } catch (error) {
  //         console.error("Error al obtener los datos de pisos:", error);
  //       }
  //     } else {
  //       setPisos([]); // Reinicia la lista de pisos si no hay inmueble seleccionado
  //     }
  //   };

  //   fetchPisos();
  // }, [formData.inmueble_id]); // Ejecutar cuando cambia el inmueble_id

  const handleChange = async(e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Si el campo cambiado es el de inmueble
  if (name === "inmueble_id") {
    setInmuebleSeleccionado(value);

    const inmueble = inmuebles.find((i) => i.id === parseInt(value));

    try {
      const pisos = await pisoService.obtenerPorInmueble(value);
      setPisos(pisos);
    } catch (error) {
      console.error("Error al obtener los pisos:", error);
    }
    // if (inmueble) {
    //   const nuevosPisos = Array.from({ length: inmueble.cantidad_pisos }, (_, index) => ({
    //     id: index + 1,
    //     nombre: `Piso ${index + 1}`,
    //   }));
    //   setPisos(nuevosPisos);
    // } else {
    //   setPisos([]); // Si no hay selección, limpia los pisos
    // }
  }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      const response = await espacioService.crearEspacio(formData.inmueble_id,formData.piso_id,formData); // Cambia esto por la URL de tu API
      alert("Espacio añadido con éxito.");
      // Aquí podrías redirigir o limpiar el formulario si lo deseas
      setFormData({
        inmueble_id: '',
        piso_id: '',
        tipoEspacio_id: '',
        nombre: '',
        descripcion: '',
        precio: '',
        capacidad: '',
        baño: 'propio',
      });
      setPisos([]); // Reinicia la lista de pisos
    } catch (error) {
      console.error("Error al añadir el espacio:", error);
      alert("Hubo un error al añadir el espacio.");

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

  return (
    <div>
      <Header />
      <Sidebar id="menu-item2" id1="menu-items2" activeClassName="espacios-anadir" />
      <>
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="#">Espacios</Link>
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
                    
                    <div className="col-12 col-md-6">
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
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <div className="form-group local-forms">
                        <label>Tipo de Espacio <span className="login-danger">*</span></label>
                        <select
                          id="tipoEspacio_id"
                          name="tipoEspacio_id"
                          value={formData.tipoEspacio_id}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="">Seleccione un tipo de espacio</option>
                          {tipoEspacios.map((tipoEspacio) => (
                            <option key={tipoEspacio.id} value={tipoEspacio.id}>{tipoEspacio.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <div className="form-group local-forms">
                        <label>Nombre <span className="login-danger">*</span></label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="form-group local-forms">
                        <label>Descripción <span className="login-danger">*</span></label>
                        <textarea
                          id="descripcion"
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleChange}
                          required
                          className="form-control"
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <div className="form-group local-forms">
                        <label>Precio <span className="login-danger">*</span></label>
                        <input
                          type="number"
                          id="precio"
                          name="precio"
                          value={formData.precio}
                          onChange={handleChange}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <div className="form-group local-forms">
                        <label>Capacidad <span className="login-danger">*</span></label>
                        <input
                          type="number"
                          id="capacidad"
                          name="capacidad"
                          value={formData.capacidad}
                          onChange={handleChange}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <div className="form-group local-forms">
                        <label>Baño <span className="login-danger">*</span></label>
                        <select
                          id="baño"
                          name="baño"
                          value={formData.baño}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="propio">Propio</option>
                          <option value="compartido">Compartido</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="doctor-submit text-end">
                        <button type="submit" className="btn btn-primary submit-form me-2">Guardar</button>
                        <button type="button" className="btn btn-primary cancel-form">Cancelar</button>
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
    </>
    </div>
  );
}  
export default EspaciosAnadir;
