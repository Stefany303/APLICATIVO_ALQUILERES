import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';

const AuthDebug = () => {
  const { user, estaAutenticado } = useAuth();
  const [tokenInfo, setTokenInfo] = useState({
    token: null,
    refreshToken: null,
    lastActivity: null
  });

  useEffect(() => {
    const updateTokenInfo = () => {
      setTokenInfo({
        token: localStorage.getItem('token')?.substring(0, 20) + '...',
        refreshToken: localStorage.getItem('refreshToken')?.substring(0, 20) + '...',
        lastActivity: new Date(parseInt(localStorage.getItem('lastActivity')) || Date.now()).toLocaleString()
      });
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  const styles = {
    debugContainer: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '15px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    },
    statusIndicator: {
      display: 'inline-block',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      marginRight: '5px',
      backgroundColor: estaAutenticado ? '#4CAF50' : '#f44336'
    },
    infoRow: {
      marginBottom: '5px',
      wordBreak: 'break-all'
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={styles.debugContainer}>
      <div style={styles.infoRow}>
        <span style={styles.statusIndicator}></span>
        Estado: {estaAutenticado ? 'Autenticado' : 'No Autenticado'}
      </div>
      <div style={styles.infoRow}>
        Usuario: {user?.nombre || 'No hay usuario'}
      </div>
      {/* <div style={styles.infoRow}>
        Token: {tokenInfo.token || 'No hay token'}
      </div>
      <div style={styles.infoRow}>
        Refresh Token: {tokenInfo.refreshToken || 'No hay refresh token'}
      </div> */}
      <div style={styles.infoRow}>
        Última actividad: {tokenInfo.lastActivity}
      </div>
    </div>
  );
};

export default AuthDebug; 