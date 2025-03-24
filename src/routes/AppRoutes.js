// src/routes/Routes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../utils/AuthContext';
import PrivateRoute from './PrivateRoute';
import AnadirInmueble from '../pages/Inmueble/AnadirInmueble';
import PersonaRegistrar from '../pages/Login/PersonaRegistrar';
import InmuebleRegistros from '../pages/Inmueble/InmuebleRegistros'; 
import EspaciosAnadir from '../pages/Espacios/EspaciosAnadir';
import EspaciosRegistrar from '../pages/Espacios/EspaciosRegistrar'; 
import EspaciosRegistros from '../pages/Espacios/EspaciosRegistros'; 
import PagosCrud from '../pages/Contabilidad/PagosCrud';
import PagosRegistrar from '../pages/Contabilidad/PagosRegistrar';
import GastosCrud from '../pages/Contabilidad/GastosCrud';
import GastosRegistrar from '../pages/Contabilidad/GastosRegistrar';
import ContratoGenerar from '../pages/Contratos/ContratoGenerar';
import ContratoRegistros from '../pages/Contratos/ContratoRegistros';
import InquilinosRegistros from '../pages/Inquilinos/InquilinosRegistros';
import CuentaConfiguracion from '../pages/Login/CuentaConfiguracion';
import Layout from './Layout';
import InquilinosRegistrar from '../pages/Inquilinos/InquilinosRegistrar';
import InquilinosPago from '../pages/Inquilinos/InquilinosPago';
import ContabilidadGastos from '../pages/Contabilidad/ContabilidadGastos';
import ContabilidadPagos from '../pages/Contabilidad/ContabilidadPagos';
import ReporteGastos from '../pages/Reportes/ReporteGastos';
import ReportePagos from '../pages/Reportes/ReportePagos';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';
import Perfil from '../pages/Login/Perfil';
import EditarPerfil from '../pages/Login/EditarPerfil';
import ConfiguracionCambioContrasena from '../pages/Login/ConfiguracionCambioContrasena';
import Login from '../pages/Login/Login';
import VerInmueble from '../pages/Inmueble/VerInmueble';
import EditarInmueble from '../pages/Inmueble/EditarInmueble';
// Importa otros componentes de página aquí

const AppRoutes = () => {
    return (
        <AuthProvider>
      
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          {/* Rutas protegidas con PrivateRoute */}
          <Route element={<PrivateRoute />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/editar-perfil" element={<EditarPerfil />} />
            <Route path="/conf-cambio-contrasena" element={<ConfiguracionCambioContrasena />} />
             <Route path="/admin-dashboard" element={<AdminDashboard />} />
            
            <Route path="/inmueble-anadir" element={<AnadirInmueble />} />
            <Route path="/persona-registrar" element={<PersonaRegistrar />} />
            <Route path="/inmueble-registros" element={<InmuebleRegistros />} />
            <Route path="/inmuebles/ver/:id" element={<VerInmueble />} />
            <Route path="/inmuebles/editar/:id" element={<EditarInmueble />} />

            <Route path="/espacios-anadir" element={<EspaciosAnadir />} />
            <Route path="/espacios-registrar" element={<EspaciosRegistrar />} />
            <Route path="/espacios-registros" element={<EspaciosRegistros />} />
            <Route path="/reporte-pagos" element={<ReportePagos />} />
            <Route path="/pagos-registrar" element={<PagosRegistrar />} />
            <Route path="/reporte-gastos" element={<ReporteGastos />} />
            <Route path="/gastos-registrar" element={<GastosRegistrar />} />
            <Route path="/contrato-generar" element={<ContratoGenerar />} />
            <Route path="/contrato-registros" element={<ContratoRegistros />} />
            <Route path="/inquilinos-registros" element={<InquilinosRegistros />} />
            <Route path="/inquilinos-registrar" element={<InquilinosRegistrar />} />
            <Route path="/inquilinos-pago" element={<InquilinosPago />} />
            <Route path="/contabilidad-pagos" element={<ContabilidadPagos />} />
            <Route path="/contabilidad-gastos" element={<ContabilidadGastos />} />
            <Route path="/cuenta-configuracion" element={<CuentaConfiguracion />} />
          </Route>

          {/* Redirección por defecto */}
          {/* <Route path="*" element={<Navigate to="/login" />} /> */}
        </Routes>
      
    </AuthProvider>
    );
};

export default AppRoutes;
