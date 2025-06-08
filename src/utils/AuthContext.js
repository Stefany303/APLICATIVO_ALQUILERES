// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import api from '../services/api';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const TOKEN_STORAGE = {
  getToken: () => localStorage.getItem('token'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  getUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  setTokens: (token, refreshToken, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('lastActivity', Date.now().toString());
  },
  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token') && !!localStorage.getItem('refreshToken');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => TOKEN_STORAGE.getUser());
  const [cargando, setCargando] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(null);
  const navigate = useNavigate();

  const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

  const updateLastActivity = () => {
    const now = Date.now();
    localStorage.setItem('lastActivity', now.toString());
  };

  const isUserInactive = () => {
    const last = parseInt(localStorage.getItem('lastActivity') || Date.now());
    return Date.now() - last >= INACTIVITY_TIMEOUT;
  };

  const refreshAccessToken = async (forceRefresh = false) => {
    try {
      const refreshToken = TOKEN_STORAGE.getRefreshToken();
      if (!refreshToken || (!forceRefresh && isUserInactive())) {
        throw new Error('Refresh no válido');
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
    } catch {
      await logout();
      return false;
    }
  };

  const verificarToken = async () => {
    const token = TOKEN_STORAGE.getToken();
    if (!token) return false;

    try {
      const response = await api.get('/auth/perfil');
      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshed = await refreshAccessToken(true);
        if (!refreshed) await logout();
        return refreshed;
      }
      return false;
    }
  };

  const setupTokenRefresh = (expiresIn) => {
    if (refreshTimer) clearTimeout(refreshTimer);
    const timer = setTimeout(() => refreshAccessToken(true), (expiresIn - 60) * 1000);
    setRefreshTimer(timer);
  };

  useEffect(() => {
    const verificar = async () => {
      if (window.location.pathname === '/login') {
        setCargando(false);
        return;
      }

      if (!TOKEN_STORAGE.isAuthenticated()) {
        TOKEN_STORAGE.clearTokens();
        setUser(null);
        window.location.href = '/login';
        return;
      }

      const valido = await verificarToken();
      if (valido) {
        setUser(TOKEN_STORAGE.getUser());
        updateLastActivity();
      } else {
        await logout();
      }

      setCargando(false);
    };

    verificar();

    const eventos = ['mousemove', 'keydown', 'click', 'scroll'];
    const actualizarActividad = () => updateLastActivity();
    eventos.forEach(e => window.addEventListener(e, actualizarActividad));

    return () => {
      eventos.forEach(e => window.removeEventListener(e, actualizarActividad));
      if (refreshTimer) clearTimeout(refreshTimer);
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

        return { success: true };
      } else {
        return { success: false, message: data.mensaje || "Respuesta de login inválida" };
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
      const token = TOKEN_STORAGE.getToken();
      if (token) {
        try {
          await api.post('/auth/logout');
        } catch {
          // No importa si falla
        }
      }
    } finally {
      TOKEN_STORAGE.clearTokens();
      setUser(null);
      if (refreshTimer) clearTimeout(refreshTimer);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  const contextValue = {
    user,
    cargando,
    login,
    logout,
    estaAutenticado: TOKEN_STORAGE.isAuthenticated() && !!user,
    refreshAccessToken,
    updateLastActivity
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
