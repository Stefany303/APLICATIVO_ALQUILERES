// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import api from '../services/api';
import { API_URL } from '../environment';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Funciones de utilidad para el manejo de tokens
const TOKEN_STORAGE = {
  getToken: () => {
    const token = localStorage.getItem('token');
    console.log('Obteniendo token:', token ? 'Token existe' : 'No hay token');
    return token;
  },
  getRefreshToken: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('Obteniendo refresh token:', refreshToken ? 'Refresh token existe' : 'No hay refresh token');
    return refreshToken;
  },
  getUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      console.log('Obteniendo usuario:', user ? 'Usuario existe' : 'No hay usuario');
      return user;
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      return null;
    }
  },
  setTokens: (token, refreshToken, user) => {
    try {
      console.log('Guardando tokens y usuario en localStorage');
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('lastActivity', Date.now().toString());
      
      // Verificar que se guardaron correctamente
      const savedToken = localStorage.getItem('token');
      const savedRefreshToken = localStorage.getItem('refreshToken');
      const savedUser = localStorage.getItem('user');
      
      console.log('Verificación de guardado:', {
        tokenGuardado: !!savedToken,
        refreshTokenGuardado: !!savedRefreshToken,
        usuarioGuardado: !!savedUser
      });
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      throw error;
    }
  },
  clearTokens: () => {
    console.log('Limpiando tokens del localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  },
  isAuthenticated: () => {
    const hasToken = !!localStorage.getItem('token');
    const hasRefreshToken = !!localStorage.getItem('refreshToken');
    console.log('Verificando autenticación:', {
      tieneToken: hasToken,
      tieneRefreshToken: hasRefreshToken
    });
    return hasToken && hasRefreshToken;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    console.log('Inicializando estado del usuario');
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
    console.log('Verificando inactividad:', {
      ultimaActividad: new Date(lastActivityTime).toLocaleString(),
      estaInactivo: inactive
    });
    return inactive;
  };

  // Función para actualizar la última actividad
  const updateLastActivity = () => {
    const newTime = Date.now();
    console.log('Actualizando última actividad:', new Date(newTime).toLocaleString());
    setLastActivity(newTime);
    localStorage.setItem('lastActivity', newTime.toString());
  };

  // Función para verificar el token con el backend
  const verificarToken = async (token = TOKEN_STORAGE.getToken()) => {
    if (!token) {
      console.log('No hay token para verificar');
      return false;
    }
    
    try {
      console.log('Verificando token con el backend');
      const response = await api.get('/auth/perfil');
      console.log('Respuesta de verificación:', response.data);
      return true;
    } catch (error) {
      console.error('Error al verificar token:', error);
      if (error.response?.status === 401) {
        console.log('Token expirado o inválido, intentando refresh...');
        const refreshSuccess = await refreshAccessToken(true);
        if (!refreshSuccess) {
          console.log('No se pudo refrescar el token, redirigiendo a login...');
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
            console.log('Token expirado, intentando refresh desde interceptor...');
            const refreshSuccess = await refreshAccessToken(true);
            if (refreshSuccess) {
              // Reintentar la petición original con el nuevo token
              const token = TOKEN_STORAGE.getToken();
              error.config.headers['Authorization'] = `Bearer ${token}`;
              return api(error.config);
            } else {
              console.log('No se pudo refrescar el token, redirigiendo a login...');
              await logout();
              navigate('/login');
            }
          } catch (refreshError) {
            console.error('Error en refresh desde interceptor:', refreshError);
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
      console.log('Intentando refrescar token, forzado:', forceRefresh);
      const refreshToken = TOKEN_STORAGE.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      if (!forceRefresh && isUserInactive()) {
        throw new Error('Usuario inactivo');
      }

      const { data } = await api.post('/auth/renovar-token', { refreshToken });
      console.log('Respuesta de refresh token:', {
        tokenRecibido: !!data.token,
        refreshTokenRecibido: !!data.refreshToken
      });
      
      if (data.token && data.refreshToken) {
        TOKEN_STORAGE.setTokens(data.token, data.refreshToken, user);
        if (data.expiresIn) {
          setupTokenRefresh(data.expiresIn);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al refrescar el token:', error);
      return false;
    }
  };

  // Configurar el temporizador para refrescar el token
  const setupTokenRefresh = (expiresIn) => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    const refreshTime = (expiresIn - 60) * 1000;
    console.log('Configurando refresh token para:', new Date(Date.now() + refreshTime).toLocaleString());
    const timer = setTimeout(() => refreshAccessToken(true), refreshTime);
    setRefreshTimer(timer);
  };

  // Efecto para verificar y restaurar la autenticación al cargar/refrescar la página
  useEffect(() => {
    console.log('Iniciando verificación de autenticación');
    const verificarAutenticacion = async () => {
      try {
        setCargando(true);
        console.log('Estado inicial del localStorage:', {
          token: !!TOKEN_STORAGE.getToken(),
          refreshToken: !!TOKEN_STORAGE.getRefreshToken(),
          user: !!TOKEN_STORAGE.getUser()
        });

        if (!TOKEN_STORAGE.isAuthenticated()) {
          console.log('No hay datos de autenticación almacenados');
          TOKEN_STORAGE.clearTokens();
          setUser(null);
          return;
        }

        let tokenValido = await verificarToken();
        console.log('Resultado de verificación de token:', tokenValido);

        if (!tokenValido) {
          console.log('Token no válido, intentando refresh...');
          tokenValido = await refreshAccessToken(true);
        }

        if (tokenValido) {
          const userData = TOKEN_STORAGE.getUser();
          console.log('Restaurando sesión con usuario:', userData?.nombre);
          setUser(userData);
          updateLastActivity();
        } else {
          console.log('No se pudo restaurar la sesión');
          await logout();
        }
      } catch (error) {
        console.error('Error en la verificación de autenticación:', error);
        await logout();
      } finally {
        setCargando(false);
      }
    };

    verificarAutenticacion();

    // Agregar event listener para beforeunload
    const handleBeforeUnload = () => {
      console.log('Página a punto de recargarse, preservando datos...');
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
      console.log('Iniciando proceso de login');
      const { data } = await api.post("/auth/login", { usuario, contraseña });
      
      if (data.token && data.persona && data.refreshToken) {
        console.log('Login exitoso, guardando datos');
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
      console.error("Error en login:", error);
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
      console.log('Iniciando proceso de logout');
      const refreshToken = TOKEN_STORAGE.getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(() => {
          console.warn('Error al hacer logout en el servidor');
        });
      }
    } finally {
      console.log('Limpiando datos de sesión');
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