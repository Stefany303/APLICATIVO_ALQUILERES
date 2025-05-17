/**
 * Configuración de entorno para la aplicación
 * Centraliza las variables de configuración para facilitar cambios entre entornos
 */

// Determinar si estamos en desarrollo o producción
const isDevelopment = process.env.NODE_ENV === 'development';

// Variables de entorno
export const environment = {
  // API URL - URL base para todas las peticiones al backend
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  
  // Tiempo de espera para peticiones (en milisegundos)
  API_TIMEOUT: 10000,
  
  // Modo de depuración - activar para ver logs detallados
  DEBUG: isDevelopment,
  
  // Versión de la aplicación
  VERSION: '1.0.0'
};

// Exportar directamente la URL de la API para uso más sencillo
export const API_URL = environment.API_URL;

export default environment;
