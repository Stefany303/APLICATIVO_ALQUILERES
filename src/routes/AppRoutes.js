// src/routes/AppRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Layout from './Layout';

// Authentication related pages
import Login from '../pages/Login/Login';
import PersonaRegistrar from '../pages/Login/PersonaRegistrar';
import Perfil from '../pages/Login/Perfil';
import EditarPerfil from '../pages/Login/EditarPerfil';
import ConfiguracionCambioContrasena from '../pages/Login/ConfiguracionCambioContrasena';
import CuentaConfiguracion from '../pages/Login/CuentaConfiguracion';

// Dashboard
import AdminDashboard from '../pages/Dashboard/AdminDashboard';

// Inmuebles
import AnadirInmueble from '../pages/Inmueble/AnadirInmueble';
import InmuebleRegistros from '../pages/Inmueble/InmuebleRegistros';
import VerInmueble from '../pages/Inmueble/VerInmueble';
import EditarInmueble from '../pages/Inmueble/EditarInmueble';

// Espacios
import EspaciosAnadir from '../pages/Espacios/EspaciosAnadir';
import EspaciosRegistrar from '../pages/Espacios/EspaciosRegistrar';
import EspaciosRegistros from '../pages/Espacios/EspaciosRegistros';

// Reportes
import ReporteGastos from '../pages/Reportes/ReporteGastos';
import ReportePagos from '../pages/Reportes/ReportePagos';

// Contratos
import ContratoGenerar from '../pages/Contratos/ContratoGenerar';
import ContratoRegistros from '../pages/Contratos/ContratoRegistros';

// Inquilinos
import InquilinosRegistros from '../pages/Inquilinos/InquilinosRegistros';
import InquilinosRegistrar from '../pages/Inquilinos/InquilinosRegistrar';
import InquilinosPago from '../pages/Inquilinos/InquilinosPago';

// Contabilidad
import PagosCrud from '../pages/Contabilidad/PagosCrud';
import PagosRegistrar from '../pages/Contabilidad/PagosRegistrar';
import GastosCrud from '../pages/Contabilidad/GastosCrud';
import GastosRegistrar from '../pages/Contabilidad/GastosRegistrar';
import ContabilidadGastos from '../pages/Contabilidad/ContabilidadGastos';
import ContabilidadPagos from '../pages/Contabilidad/ContabilidadPagos';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Private routes - All routes that require authentication */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* User account */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/conf-cambio-contrasena" element={<ConfiguracionCambioContrasena />} />
          <Route path="/cuenta-configuracion" element={<CuentaConfiguracion />} />
          <Route path="/persona-registrar" element={<PersonaRegistrar />} />
          
          {/* Inmuebles */}
          <Route path="/inmueble-anadir" element={<AnadirInmueble />} />
          <Route path="/inmueble-registros" element={<InmuebleRegistros />} />
          <Route path="/inmuebles/ver/:id" element={<VerInmueble />} />
          <Route path="/inmuebles/editar/:id" element={<EditarInmueble />} />
          
          {/* Espacios */}
          <Route path="/espacios-anadir" element={<EspaciosAnadir />} />
          <Route path="/espacios-registrar" element={<EspaciosRegistrar />} />
          <Route path="/espacios-registros" element={<EspaciosRegistros />} />
          
          {/* Reportes */}
          <Route path="/reporte-pagos" element={<ReportePagos />} />
          <Route path="/reporte-gastos" element={<ReporteGastos />} />
          
          {/* Contratos */}
          <Route path="/contrato-generar" element={<ContratoGenerar />} />
          <Route path="/contrato-registros" element={<ContratoRegistros />} />
          
          {/* Inquilinos */}
          <Route path="/inquilinos-registros" element={<InquilinosRegistros />} />
          <Route path="/inquilinos-registrar" element={<InquilinosRegistrar />} />
          <Route path="/inquilinos-pago" element={<InquilinosPago />} />
          
          {/* Contabilidad */}
          <Route path="/contabilidad-pagos" element={<ContabilidadPagos />} />
          <Route path="/contabilidad-gastos" element={<ContabilidadGastos />} />
          <Route path="/pagos-crud" element={<PagosCrud />} />
          <Route path="/pagos-registrar" element={<PagosRegistrar />} />
          <Route path="/gastos-crud" element={<GastosCrud />} />
          <Route path="/gastos-registrar" element={<GastosRegistrar />} />
        </Route>
      </Route>
      
      {/* Default route redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
