export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const environment = {
  API_URL,
  // Otras configuraciones del entorno
  APP_NAME: 'Sistema de Rentas',
  VERSION: '1.0.0',
  ENV: process.env.NODE_ENV || 'development'
};

export default environment; 