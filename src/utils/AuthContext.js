// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import api from '../services/api';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // Configurar interceptor de Axios
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(config => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setCargando(false);
          return;
        }

        // Verificar token con el backend
        await api.get("/auth/verify");
        const usuarioAlmacenado = localStorage.getItem("user");
        if (usuarioAlmacenado) {
          setUser(JSON.parse(usuarioAlmacenado));
        }
      } catch (error) {
        console.error("Error de verificación:", error);
        if (error.response && error.response.status === 401) {
          console.warn("🔴 Token inválido o expirado. Cerrando sesión...");
          logout();
        } else {
          console.warn("⚠️ Error inesperado, pero no cerramos sesión.");
        }
      } finally {
        setCargando(false);
      }
    };

    verificarAutenticacion();
  }, []);

  const login = async (usuario, contraseña) => {
    try {
      const { data } = await api.post("/auth/login", { usuario, contraseña });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.persona));
      setUser(data.persona);
      
      navigate("/admin-dashboard");
      return { success: true };
    } catch (error) {
      let mensajeError = "Error de conexión";
      if (error.response) {
        mensajeError = error.response.data.mensaje || 
                      error.response.data.error ||
                      "Credenciales inválidas";
      }
      return { success: false, message: mensajeError };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const valorContexto = {
    user,
    cargando,
    login,
    logout,
    estaAutenticado: !!user
  };

  return (
    <AuthContext.Provider value={valorContexto}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};