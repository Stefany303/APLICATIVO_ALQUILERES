import { useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos en milisegundos

export const useInactivityManager = () => {
  const { logout } = useAuth();

  const resetInactivityTimer = useCallback(() => {
    const existingTimer = window._inactivityTimer;
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    window._inactivityTimer = setTimeout(() => {
      console.warn('⚠️ Sesión cerrada por inactividad');
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  const handleUserActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  useEffect(() => {
    // Lista de eventos que consideramos como actividad del usuario
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'keypress'
    ];

    // Iniciar el temporizador
    resetInactivityTimer();

    // Agregar listeners para todos los eventos de actividad
    activityEvents.forEach(eventName => {
      document.addEventListener(eventName, handleUserActivity);
    });

    // Limpiar al desmontar
    return () => {
      if (window._inactivityTimer) {
        clearTimeout(window._inactivityTimer);
      }
      activityEvents.forEach(eventName => {
        document.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, [handleUserActivity, resetInactivityTimer]);

  return null;
}; 