//import logo from './logo.svg';
import React from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './utils/AuthContext';
import { ConfigProvider, App as AntdApp } from 'antd';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2E37A4', // Color primario de tu marca
        },
      }}
      // Desactiva la advertencia de compatibilidad de versión
      warning={{ strict: false }}
    >
      <AntdApp>
        <div className="App">
          <Router>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </Router>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
