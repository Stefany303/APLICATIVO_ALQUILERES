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
  const navigate = useNavigate();

  const alternarVisibilidadContraseña = () => {
    setContraseñaVisible(!contraseñaVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validación de campos vacíos
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
      setError(err.response?.data?.mensaje || "Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="main-wrapper login-body">
      <div className="container-fluid px-0">
        <div className="row">
          <div className="col-lg-6 login-wrap">
            <div className="login-sec">
              <div className="log-img">
                <img className="img-fluid" src={login02} alt="Ilustración de login" />
              </div>
            </div>
          </div>

          <div className="col-lg-6 login-wrap-bg">
            <div className="login-wrapper">
              <div className="loginbox">
                <div className="login-right">
                  <div className="login-right-wrap">
                    <div className="account-logo">
                      <Link to="/admin-dashboard">
                        <img src={loginlogo} alt="Logo de la empresa" />
                      </Link>
                    </div>
                    <h2>Login</h2>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label>
                          Usuario <span className="login-danger">*</span>
                        </label>
                        <input
                          type="text"
                          value={usuario}
                          onChange={(e) => setUsuario(e.target.value)}
                          className="form-control"
                          disabled={cargando}
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Contraseña <span className="login-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type={contraseñaVisible ? "text" : "password"}
                            className="form-control pass-input"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            disabled={cargando}
                          />
                          <span
                            className="toggle-password"
                            onClick={alternarVisibilidadContraseña}
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              cursor: "pointer",
                            }}
                          >
                            {contraseñaVisible ? (
                              <FiEyeOff className="react-feather-custom" />
                            ) : (
                              <FiEye className="react-feather-custom" />
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="forgotpass">
                        <div className="remember-me">
                          <label className="custom_check mr-2 mb-0 d-inline-flex remember-me">
                            Recordarme
                            <input type="checkbox" name="radio" disabled={cargando} />
                            <span className="checkmark" />
                          </label>
                        </div>
                        <Link to="/forgotpassword">¿Olvidaste tu contraseña?</Link>
                      </div>

                      <div className="form-group login-btn">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-block"
                          disabled={cargando}
                        >
                          {cargando ? (
                            <span>
                              <span className="spinner-border spinner-border-sm" role="status" />
                              Cargando...
                            </span>
                          ) : (
                            "Ingresar"
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="next-sign">
                      <p className="account-subtitle">
                        ¿Necesitas una cuenta? <Link to="/signup">Regístrate</Link>
                      </p>
                      <div className="social-login">
                        <Link to="#">
                          <img src={loginicon01} alt="Red social 1" />
                        </Link>
                        <Link to="#">
                          <img src={loginicon02} alt="Red social 2" />
                        </Link>
                        <Link to="#">
                          <img src={loginicon03} alt="Red social 3" />
                        </Link>
                      </div>
                    </div>
                  </div>
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