import React, { useState } from 'react';
import '../../assets/styles/form-styles.css'; // Asegúrate de que la ruta sea correcta
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar"; 
import CrearUsuarioSistemaModal from './CrearUsuarioSistema';
import { Modal, Form, Input, Button, Checkbox, message } from "antd";
import personaService from '../../services/personaService';

const PersonaRegistrar = () => {
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    rol: '', // Valor por defecto
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Campo: ${name}, Valor: ${value}`); // Depuración
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Datos enviados:', formData); // Depuración
    try {
      await personaService.crearPersona(formData);
      alert('Persona registrada exitosamente');
      setFormData({
        dni: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        rol: '',
      });
    } catch (error) {
      console.error('Error registrando persona:', error);
      alert('Error al registrar la persona');

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




  const [openModal, setOpenModal] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(false);

  const handleCheckboxChange = () => {
    setEnableRegistration(!enableRegistration);
    if (!enableRegistration) {
      setOpenModal(true); // Abre el modal cuando se activa el checkbox
    }
  };
  const [createAccount, setCreateAccount] = useState(false);

  return (
    <div>
      <Header />
      <Sidebar id="menu-item2" id1="menu-items2" activeClassName="persona-registrar" />
      <>
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="#">Inmueble</Link>
                </li>
                <li className="breadcrumb-item">
                  <i className="feather-chevron-right">
                    <FaChevronRight icon="chevron-right" />
                  </i>
                </li>
                <li className="breadcrumb-item active">Registrar</li>
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
                        <h4>Registro de Información de la Persona</h4>
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>DNI <span className="login-danger">*</span></label>
                        <input className="form-control" name='dni' value={formData.dni} onChange={handleChange} type="text" required />
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Nombre <span className="login-danger">*</span></label>
                        <input className="form-control"  name='nombre' value={formData.nombre} onChange={handleChange}  type="text" required />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Apellidos <span className="login-danger">*</span></label>
                        <input className="form-control"  name='apellido' value={formData.apellido} onChange={handleChange}  type="text" required />
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Email <span className="login-danger">*</span></label>
                        <input className="form-control"  name='email' value={formData.email} onChange={handleChange}  type="email" required />
                      </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Teléfono</label>
                        <input className="form-control"  name='telefono' value={formData.telefono} onChange={handleChange}  type="text" />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Dirección <span className="login-danger">*</span></label>
                        <input className="form-control"  name='direccion' value={formData.direccion} onChange={handleChange}  type="text" required />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6 col-xl-3">
                      <div className="form-group local-forms">
                        <label>Rol <span className="login-danger">*</span></label>
                        <select className="form-control" name="rol" value={formData.rol} onChange={handleChange} required>
                          <option value="">Seleccione un rol</option>
                          <option value="propietario">Propietario</option>
                          <option value="inquilino">Inquilino</option>
                          <option value="administrador">Administrador</option>
                        </select>
                      </div>
                    </div>



                    <div className="col-12 col-md-6 col-xl-6">
                      {/* Modal de registro de usuario */}
                      {/* <CrearUsuarioSistemaModal open={openModal} setOpen={setOpenModal} /> */}
                     {/* Checkbox que abre el modal */}
       <Form layout="vertical">
         <Form.Item>
           <Checkbox checked={createAccount} onChange={() => setCreateAccount(!createAccount)}>
            Crear cuenta de usuario
          </Checkbox>
          {/* <CrearUsuarioSistemaModal createAccount={createAccount} setCreateAccount={setCreateAccount} /> */}

        </Form.Item>
      </Form>
                    </div>
                    {createAccount && (
        <>
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Usuario</label>
                        <input className="form-control" type="text" />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Contraseña <span className="login-danger">*</span></label>
                        <input className="form-control" type="text" required />
                      </div>
                    </div>
                    </>
      )}
                    <div className="col-12">
                      <div className="doctor-submit text-end">
                        <button type="submit" className="btn btn-primary submit-form me-2">
                          Guardar Información
                        </button>
                        <button type="button" className="btn btn-primary cancel-form">
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
    </>
    </div>
  );
};

export default PersonaRegistrar;
