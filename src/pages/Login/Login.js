import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  login02,
  loginicon01,
  loginicon02,
  loginicon03,
  loginlogo,
} from "../../components/imagepath";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import { useAuth } from "../../utils/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [contraseñaVisible, setContraseñaVisible] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [usuarioFocus, setUsuarioFocus] = useState(false);
  const [contraseñaFocus, setContraseñaFocus] = useState(false);
  const navigate = useNavigate();

  const alternarVisibilidadContraseña = () => {
    setContraseñaVisible(!contraseñaVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!usuario.trim() || !contraseña.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setCargando(true);
      const result = await login(usuario, contraseña);

      if (result.success) {
        navigate("/admin-dashboard");
      } else {
        setError(result.message || "Error de autenticación");
      }

    } catch (err) {
      if (err.response?.data?.mensaje) {
        setError(err.response.data.mensaje);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Error de conexión con el servidor");
      }
    } finally {
      setCargando(false);
    }
  };

  const floatingLabelStyle = {
    position: 'absolute',
    left: '12px',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    color: '#6c757d',
    backgroundColor: '#fff',
    padding: '0 4px',
    fontSize: '16px',
    fontWeight: 500
  };

  const getFloatingLabelPosition = (isFocused, hasValue) => {
    if (isFocused || hasValue) {
      return {
        ...floatingLabelStyle,
        top: '-8px',
        fontSize: '12px',
        color: '#007bff',
        fontWeight: 600
      };
    }
    return {
      ...floatingLabelStyle,
      top: '50%',
      transform: 'translateY(-50%)'
    };
  };

  const inputContainerStyle = {
    position: 'relative',
    marginBottom: '24px'
  };

  const inputStyle = {
    borderRadius: '8px',
    height: '44px',
    fontSize: '16px',
    padding: '12px',
    border: '2px solid #e1e8ed',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    width: '100%'
  };

  const inputFocusStyle = {
    ...inputStyle,
    border: '2px solid #007bff',
    outline: 'none',
    boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
  };

  return (
    <div className="main-wrapper login-body" style={{
      minHeight: '100vh',
      background: '#f4f6fb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="container-fluid px-0" style={{
        width: '100%',
        maxWidth: 1100,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        borderRadius: 24,
        overflow: 'hidden',
        background: '#fff'
      }}>
        <div className="row g-0" style={{ minHeight: 600 }}>
          <div className="col-lg-6 d-none d-lg-flex align-items-stretch" style={{ background: '#e9f0fa' }}>
            <div className="d-flex align-items-center justify-content-center w-100 p-4">
              <img
                src={login02}
                alt="Ilustración de login"
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>

          <div className="col-lg-6 d-flex align-items-center justify-content-center p-3 p-lg-5">
            <div className="w-100" style={{ maxWidth: 400 }}>
              <div className="text-center mb-4">
                <Link to="/admin-dashboard">
                  <img
                    src={loginlogo}
                    alt="Logo de la empresa"
                    style={{ maxWidth: 120 }}
                  />
                </Link>
              </div>

              <h2 className="mb-4 text-center" style={{ fontWeight: 700, color: '#2d3a4b' }}>
                Iniciar Sesión
              </h2>

              {error && (
                <div className="alert alert-danger text-center mb-4" style={{ borderRadius: 8, fontSize: 15 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Campo Usuario con Label Flotante */}
                <div style={inputContainerStyle}>
                  <label 
                    style={getFloatingLabelPosition(usuarioFocus, usuario)}
                  >
                    Usuario <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    onFocus={() => setUsuarioFocus(true)}
                    onBlur={() => setUsuarioFocus(false)}
                    disabled={cargando}
                    style={usuarioFocus ? inputFocusStyle : inputStyle}
                  />
                </div>

                {/* Campo Contraseña con Label Flotante */}
                <div style={inputContainerStyle}>
                  <label 
                    style={getFloatingLabelPosition(contraseñaFocus, contraseña)}
                  >
                    Contraseña <span className="text-danger">*</span>
                  </label>
                  <input
                    type={contraseñaVisible ? "text" : "password"}
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    onFocus={() => setContraseñaFocus(true)}
                    onBlur={() => setContraseñaFocus(false)}
                    disabled={cargando}
                    style={{
                      ...(contraseñaFocus ? inputFocusStyle : inputStyle),
                      paddingRight: '40px'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute"
                    onClick={alternarVisibilidadContraseña}
                    style={{
                      cursor: "pointer",
                      color: '#888',
                      fontSize: 20,
                      textDecoration: 'none',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      padding: '8px'
                    }}
                  >
                    {contraseñaVisible ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      disabled={cargando}
                    />
                    <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: 14 }}>
                      Recordarme
                    </label>
                  </div>
                  <Link to="/forgotpassword" style={{ fontSize: 14 }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="mb-4">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={cargando}
                    style={{
                      borderRadius: 8,
                      height: 44,
                      fontWeight: 600,
                      fontSize: 16
                    }}
                  >
                    {cargando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Cargando...
                      </>
                    ) : (
                      "Ingresar"
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <p className="mb-2" style={{ fontSize: 15 }}>
                  ¿Necesitas una cuenta? <Link to="/signup">Regístrate</Link>
                </p>
                <div className="d-flex justify-content-center gap-3 mt-3">
                  <Link to="#">
                    <img src={loginicon01} alt="Red social 1" style={{ width: 32 }} />
                  </Link>
                  <Link to="#">
                    <img src={loginicon02} alt="Red social 2" style={{ width: 32 }} />
                  </Link>
                  <Link to="#">
                    <img src={loginicon03} alt="Red social 3" style={{ width: 32 }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
