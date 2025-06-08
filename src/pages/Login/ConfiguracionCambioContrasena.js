import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Link, useNavigate } from 'react-router-dom'
import { FaChevronRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import personaService from '../../services/personaService';

const reglas = [
  {
    key: 'minLength',
    label: 'Al menos 8 caracteres',
    test: (v) => v.length >= 8,
  },
  {
    key: 'mayuscula',
    label: 'Al menos una mayúscula',
    test: (v) => /[A-Z]/.test(v),
  },
  {
    key: 'minuscula',
    label: 'Al menos una minúscula',
    test: (v) => /[a-z]/.test(v),
  },
  {
    key: 'numero',
    label: 'Al menos un número',
    test: (v) => /[0-9]/.test(v),
  },
  {
    key: 'simbolo',
    label: 'Al menos un símbolo (!@#$%^&*)',
    test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v),
  },
];

const ConfiguracionCambioContrasena = () => {
  const [anterior, setAnterior] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [tocado, setTocado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Validaciones
  const reglasCumplidas = reglas.map(r => r.test(nueva));
  const todasCumplidas = reglasCumplidas.every(Boolean);
  const coincide = nueva === confirmar && nueva.length > 0;

  const puedeGuardar = todasCumplidas && coincide && anterior.length > 0 && !cargando;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTocado(true);
  
    if (!puedeGuardar) return;
  
    setCargando(true);
    try {
      await personaService.cambiarContrasena(anterior, nueva);
  
      Swal.fire({
        title: '¡Éxito!',
        text: 'La contraseña se cambió correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        navigate('/login');
      });
  
      setAnterior('');
      setNueva('');
      setConfirmar('');
      setTocado(false);
    } catch (error) {
      const mensajeError = error.response?.data?.mensaje;
      let textoError = 'No se pudo cambiar la contraseña';
      
      if (mensajeError && mensajeError.toLowerCase().includes('incorrecta')) {
        textoError = 'La contraseña actual es incorrecta';
      } else if (mensajeError) {
        textoError = mensajeError;
      }

      Swal.fire({
        title: 'Error',
        text: textoError,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setCargando(false);
    }
  };
  

  return (
    <div>
        <Header/>
        <Sidebar id="menu-item7" id1="menu-items7" activeClassName="conf-cambio-contrasena" />
        <div className="page-wrapper">
  {/* Page Content */}
  <div className="content container-fluid">
    {/* Page Header */}
    <div className="page-header">
      <div className="row">
        <div className="col-sm-12">
          <ul className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="index.html">Configuracion</Link>
            </li>
            <li className="breadcrumb-item">
              <i className="feather-chevron-right">
                <FaChevronRight icon="chevron-right"/>
                </i>
            </li>
            <li className="breadcrumb-item active">Cambio de Contraseña</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="row">
                <h4 className="page-title">Cambio de Contraseña</h4>
                <div className="col-12 col-md-6 col-xl-12">
                  <div className="form-group local-forms">
                    <label>
                      Contraseña Anterior <span className="login-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      value={anterior}
                      onChange={e => setAnterior(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6 col-xl-6">
                  <div className="form-group local-forms">
                    <label>
                      Nueva Contraseña <span className="login-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      value={nueva}
                      onChange={e => setNueva(e.target.value)}
                      required
                      onBlur={() => setTocado(true)}
                    />
                    <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: 10 }}>
                      {reglas.map((r, i) => (
                        <li key={r.key} style={{ color: reglasCumplidas[i] ? '#28a745' : '#dc3545', display: 'flex', alignItems: 'center', fontSize: 15 }}>
                          {reglasCumplidas[i] ? <FaCheckCircle style={{ marginRight: 6 }} /> : <FaTimesCircle style={{ marginRight: 6 }} />}
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="col-12 col-md-6 col-xl-6">
                  <div className="form-group local-forms">
                    <label>
                      Confirma la contraseña <span className="login-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      value={confirmar}
                      onChange={e => setConfirmar(e.target.value)}
                      required
                      onBlur={() => setTocado(true)}
                    />
                    {tocado && confirmar && !coincide && (
                      <div style={{ color: '#dc3545', fontSize: 14, marginTop: 4 }}>
                        Las contraseñas no coinciden
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <div className="doctor-submit text-end">
                    <button
                      type="submit"
                      className="btn btn-primary submit-form me-2"
                      disabled={!puedeGuardar}
                      style={{ opacity: puedeGuardar ? 1 : 0.6 }}
                    >
                      {cargando ? 'Guardando...' : 'Guardar'}
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
  {/* /Page Content */}
  <div className="notification-box">
    <div className="msg-sidebar notifications msg-noti">
      <div className="topnav-dropdown-header">
        <span>Messages</span>
      </div>
      <div className="drop-scroll msg-list-scroll" id="msg_list">
        <ul className="list-box">
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">R</span>
                </div>
                <div className="list-body">
                  <span className="message-author">Richard Miles </span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item new-message">
                <div className="list-left">
                  <span className="avatar">J</span>
                </div>
                <div className="list-body">
                  <span className="message-author">John Doe</span>
                  <span className="message-time">1 Aug</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">T</span>
                </div>
                <div className="list-body">
                  <span className="message-author"> Tarah Shropshire </span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">M</span>
                </div>
                <div className="list-body">
                  <span className="message-author">Mike Litorus</span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">C</span>
                </div>
                <div className="list-body">
                  <span className="message-author"> Catherine Manseau </span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">D</span>
                </div>
                <div className="list-body">
                  <span className="message-author"> Domenic Houston </span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">B</span>
                </div>
                <div className="list-body">
                  <span className="message-author"> Buster Wigton </span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">R</span>
                </div>
                <div className="list-body">
                  <span className="message-author"> Rolland Webber </span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">C</span>
                </div>
                <div className="list-body">
                  <span className="message-author"> Claire Mapes </span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">M</span>
                </div>
                <div className="list-body">
                  <span className="message-author">Melita Faucher</span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">J</span>
                </div>
                <div className="list-body">
                  <span className="message-author">Jeffery Lalor</span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">L</span>
                </div>
                <div className="list-body">
                  <span className="message-author">Loren Gatlin</span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="chat.html">
              <div className="list-item">
                <div className="list-left">
                  <span className="avatar">T</span>
                </div>
                <div className="list-body">
                  <span className="message-author">Tarah Shropshire</span>
                  <span className="message-time">12:28 AM</span>
                  <div className="clearfix" />
                  <span className="message-content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                  </span>
                </div>
              </div>
            </Link>
          </li>
        </ul>
      </div>
      <div className="topnav-dropdown-footer">
        <Link to="chat.html">See all messages</Link>
      </div>
    </div>
  </div>
</div>

      
    </div>
  )
}

export default ConfiguracionCambioContrasena
