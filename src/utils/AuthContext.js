// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import api from '../services/api';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Funciones de utilidad para el manejo de tokens
const TOKEN_STORAGE = {
  getToken: () => {
    const token = localStorage.getItem('token');
    return token;
  },
  getRefreshToken: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return refreshToken;
  },
  getUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      return user;
    } catch (error) {
      return null;
    }
  },
  setTokens: (token, refreshToken, user) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('lastActivity', Date.now().toString());
      
      // Verificar que se guardaron correctamente
      const savedToken = localStorage.getItem('token');
      const savedRefreshToken = localStorage.getItem('refreshToken');
      const savedUser = localStorage.getItem('user');
      
     
    } catch (error) {
      throw error;
    }
  },
  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  },
  isAuthenticated: () => {
    const hasToken = !!localStorage.getItem('token');
    const hasRefreshToken = !!localStorage.getItem('refreshToken');
    return hasToken && hasRefreshToken;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return TOKEN_STORAGE.getUser();
  });
  const [cargando, setCargando] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const navigate = useNavigate();
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Constante para el tiempo de inactividad (15 minutos)
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

  // Función para verificar si el usuario está inactivo
  const isUserInactive = () => {
    const lastActivityTime = parseInt(localStorage.getItem('lastActivity') || Date.now());
    const inactive = Date.now() - lastActivityTime >= INACTIVITY_TIMEOUT;
    return inactive;
  };

  // Función para actualizar la última actividad
  const updateLastActivity = () => {
    const newTime = Date.now();
    setLastActivity(newTime);
    localStorage.setItem('lastActivity', newTime.toString());
  };

  // Función para verificar el token con el backend
  const verificarToken = async (token = TOKEN_STORAGE.getToken()) => {
    if (!token) {
      return false;
    }
    
    try {
      const response = await api.get('/auth/perfil');
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshSuccess = await refreshAccessToken(true);
        if (!refreshSuccess) {
          await logout();
          navigate('/login');
        }
        return refreshSuccess;
      }
      return false;
    }
  };

  // Configurar interceptor global para manejar errores 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          try {
            const refreshSuccess = await refreshAccessToken(true);
            if (refreshSuccess) {
              // Reintentar la petición original con el nuevo token
              const token = TOKEN_STORAGE.getToken();
              error.config.headers['Authorization'] = `Bearer ${token}`;
              return api(error.config);
            } else {
              await logout();
              navigate('/login');
            }
          } catch (refreshError) {
            await logout();
            navigate('/login');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // Función para refrescar el token
  const refreshAccessToken = async (forceRefresh = false) => {
    try {
      const refreshToken = TOKEN_STORAGE.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      if (!forceRefresh && isUserInactive()) {
        throw new Error('Usuario inactivo');
      }

      const { data } = await api.post('/auth/renovar-token', { refreshToken });
      
      if (data.token && data.refreshToken) {
        TOKEN_STORAGE.setTokens(data.token, data.refreshToken, user);
        if (data.expiresIn) {
          setupTokenRefresh(data.expiresIn);
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Configurar el temporizador para refrescar el token
  const setupTokenRefresh = (expiresIn) => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    const refreshTime = (expiresIn - 60) * 1000;
    const timer = setTimeout(() => refreshAccessToken(true), refreshTime);
    setRefreshTimer(timer);
  };

  // Efecto para verificar y restaurar la autenticación al cargar/refrescar la página
  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        setCargando(true);

        if (!TOKEN_STORAGE.isAuthenticated()) {
          TOKEN_STORAGE.clearTokens();
          setUser(null);
          return;
        }

        let tokenValido = await verificarToken();
        if (!tokenValido) {
          tokenValido = await refreshAccessToken(true);
        }

        if (tokenValido) {
          const userData = TOKEN_STORAGE.getUser();
          setUser(userData);
          updateLastActivity();
        } else {
          await logout();
        }
      } catch (error) {
        await logout();
      } finally {
        setCargando(false);
      }
    };

    verificarAutenticacion();

    // Agregar event listener para beforeunload
    const handleBeforeUnload = () => {
      // No hacemos nada, solo aseguramos que no se limpie el localStorage
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const login = async (usuario, contraseña) => {
    try {
      const { data } = await api.post("/auth/login", { usuario, contraseña });
      
      if (data.token && data.persona && data.refreshToken) {
        TOKEN_STORAGE.setTokens(data.token, data.refreshToken, data.persona);
        setUser(data.persona);
        updateLastActivity();
        
        if (data.expiresIn) {
          setupTokenRefresh(data.expiresIn);
        }
        
        navigate("/admin-dashboard");
        return { success: true };
      } else {
        throw new Error("Respuesta de login inválida");
      }
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

  const logout = async () => {
    try {
      const refreshToken = TOKEN_STORAGE.getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      TOKEN_STORAGE.clearTokens();
      setUser(null);
      navigate('/login');
    }
  };

  const valorContexto = {
    user,
    cargando,
    login,
    logout,
    estaAutenticado: TOKEN_STORAGE.isAuthenticated() && !!user,
    refreshAccessToken,
    updateLastActivity
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