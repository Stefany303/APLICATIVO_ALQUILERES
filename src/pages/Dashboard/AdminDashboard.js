import React, { useState, useEffect } from "react";
import DonutChart from "../Dashboard//DonutChart";
import { FaChevronRight, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import InquilinosChart from "../Dashboard/InquilinosChart";
import IngresosGastosChart from "../Dashboard/IngresosGastosChart";
import Select from "react-select";
import {
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  calendar,
  dep_icon1,
  dep_icon2,
  dep_icon3,
  dep_icon4,
  dep_icon5,
  empty_wallet,
  imagesend,
  morning_img_01,
  profile_add,
  scissor,
  user001,
} from "../../components/imagepath";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { useAuth } from "../../utils/AuthContext";
import reporteService from '../../services/reporteService';
import { message, Spin, Card, Row, Col, Statistic, Progress, Table } from 'antd';
import moment from 'moment';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalClientes: 0,
    espaciosOcupados: 0,
    espaciosDisponibles: 0,
    ingresosMensuales: 0,
    pagosPendientes: 0,
    contratosActivos: 0,
    contratosPorVencer: 0,
    totalEspacios: 0,
    pagosDelMes: {
      completados: 0,
      pendientes: 0,
      retrasados: 0,
      totalMonto: 0
    },
    // Añadir datos para la tendencia
    tendencia: {
      clientes: 0, // positivo = aumento, negativo = disminución
      ingresos: 0,
      contratos: 0,
      ocupacion: 0
    },
    // Datos completos del API
    datosCrudos: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generar opciones de años (últimos 10 años)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString()
  }));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Iniciando carga de datos del dashboard...');
        
        // Usar el nuevo servicio para obtener todos los datos en una sola llamada
        const dashboardResponse = await reporteService.obtenerDatosDashboard();
        console.log('Datos recibidos del dashboard:', dashboardResponse);
        
        if (!dashboardResponse) {
          throw new Error('No se recibieron datos del dashboard');
        }
        
        // Procesar los datos recibidos
        const {
          totalInquilinos,
          espaciosDisponibles,
          ingresos,
          gastos,
          contratos,
          ocupacion,
          contratosPorVencer,
          pagos,
          contratosVencidos
        } = dashboardResponse;
        
        // Calcular totales
        let totalClientes = totalInquilinos?.data?.[0]?.total_inquilinos || 0;
        
        // Calcular espacios totales, ocupados y disponibles
        let espaciosOcupadosTotal = 0;
        let espaciosDisponiblesTotal = 0;
        let espaciosTotalGeneral = 0;
        
        if (Array.isArray(espaciosDisponibles)) {
          espaciosDisponibles.forEach(inmueble => {
            const ocupados = parseInt(inmueble.espacios_ocupados || 0);
            const disponibles = parseInt(inmueble.espacios_disponibles || 0);
            
            espaciosOcupadosTotal += ocupados;
            espaciosDisponiblesTotal += disponibles;
            espaciosTotalGeneral += inmueble.total_espacios || 0;
          });
        }
        
        // Calcular ingresos mensuales (último mes disponible)
        let ingresosMensuales = 0;
        if (Array.isArray(ingresos) && ingresos.length > 0) {
          // Ordenar por mes (del más reciente al más antiguo)
          ingresos.sort((a, b) => b.mes.localeCompare(a.mes));
          ingresosMensuales = parseFloat(ingresos[0].total_ingresos) || 0;
        }
        
        // Calcular pagos pendientes del mes actual
        let pagosPendientesTotal = 0;
        let pagosCompletados = 0;
        let pagosPendientes = 0;
        let pagosRetrasados = 0;
        
        if (Array.isArray(pagos)) {
          // Obtener el mes actual en formato YYYY-MM
          const mesActual = moment().format('YYYY-MM');
          
          // Buscar los pagos del mes actual
          const pagoMesActual = pagos.find(p => p.mes === mesActual) || pagos[0]; // Si no hay del mes actual, usar el primero
          
          if (pagoMesActual) {
            pagosCompletados = parseFloat(pagoMesActual.monto_pagado || 0);
            pagosPendientes = parseFloat(pagoMesActual.monto_pendiente || 0);
            pagosPendientesTotal = pagosPendientes;
          }
          
          // Para demo, distribuir pagos pendientes entre pendientes y retrasados
          if (pagosPendientes > 0) {
            pagosRetrasados = Math.round(pagosPendientes * 0.3); // 30% retrasados
            pagosPendientes = Math.round(pagosPendientes * 0.7); // 70% pendientes
          }
        }
        
        // Obtener contratos activos
        let contratosActivos = parseInt(contratos?.data?.contratos_activos_mes_actual || 0);
        
        // Obtener contratos por vencer
        let contratosPorVencerTotal = Array.isArray(contratosPorVencer) ? contratosPorVencer.length : 0;
        
        // Calcular tendencias
        const tendenciaClientes = totalInquilinos?.variacion_porcentual || 0;
        const tendenciaContratos = contratos?.variacion_porcentual || 0;
        
        // Calcular tendencia de ingresos (comparando los dos meses más recientes)
        let tendenciaIngresos = 0;
        if (Array.isArray(ingresos) && ingresos.length >= 2) {
          const ingresoActual = parseFloat(ingresos[0].total_ingresos) || 0;
          const ingresoAnterior = parseFloat(ingresos[1].total_ingresos) || 0;
          
          if (ingresoAnterior > 0) {
            tendenciaIngresos = ((ingresoActual - ingresoAnterior) / ingresoAnterior) * 100;
          }
        }
        
        // Calcular tendencia de ocupación
        let tendenciaOcupacion = 0;
        if (espaciosTotalGeneral > 0) {
          const tasaOcupacion = (espaciosOcupadosTotal / espaciosTotalGeneral) * 100;
          // Para simplificar, usamos un valor positivo si la ocupación es mayor al 50%
          tendenciaOcupacion = tasaOcupacion > 50 ? 5 : -5;
        }
        
        // Estructurar pagos del mes para el gráfico
        const pagosDelMes = {
          completados: pagosCompletados > 0 ? 1 : 0, // Convertir a contador
          pendientes: pagosPendientes > 0 ? 1 : 0,   // Convertir a contador
          retrasados: pagosRetrasados > 0 ? 1 : 0,   // Convertir a contador
          totalMonto: pagosCompletados + pagosPendientes + pagosRetrasados
        };
        
        // Asegurarnos de que haya al menos un valor para el gráfico
        if (pagosDelMes.completados + pagosDelMes.pendientes + pagosDelMes.retrasados === 0) {
          pagosDelMes.completados = 1;
        }
        
        // Actualizar datos del dashboard
        const newDashboardData = {
          totalClientes,
          espaciosOcupados: espaciosOcupadosTotal,
          espaciosDisponibles: espaciosDisponiblesTotal,
          ingresosMensuales,
          pagosPendientes: pagosPendientesTotal,
          contratosActivos,
          contratosPorVencer: contratosPorVencerTotal,
          totalEspacios: espaciosTotalGeneral,
          pagosDelMes,
          tendencia: {
            clientes: tendenciaClientes,
            ingresos: tendenciaIngresos,
            contratos: tendenciaContratos,
            ocupacion: tendenciaOcupacion
          },
          // Guardar los datos crudos para referencias futuras
          datosCrudos: dashboardResponse
        };
        
        console.log('Datos procesados del dashboard:', newDashboardData);
        setDashboardData(newDashboardData);

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setError({
          message: 'Error al cargar los datos del dashboard',
          details: error.response?.data || error.message
        });
        message.error('Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Función para renderizar el indicador de tendencia
  const renderTendencia = (valor) => {
    if (valor > 0) {
      return <span className="text-success"><FaArrowUp /> {Math.abs(valor).toFixed(1)}%</span>;
    } else if (valor < 0) {
      return <span className="text-danger"><FaArrowDown /> {Math.abs(valor).toFixed(1)}%</span>;
    }
    return <span>0%</span>;
  };

  // Calcular porcentajes de forma segura
  const calcularPorcentaje = (valor, total) => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Spin size="large" tip="Cargando datos del dashboard..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error al cargar el dashboard</h4>
            <p>{error.message}</p>
            {error.details && (
              <pre className="mt-3">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            )}
            <button 
              className="btn btn-primary mt-3" 
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Sidebar
        id="menu-item"
        id1="menu-items"
        activeClassName="admin-dashboard"
      />
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Dashboard </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FaChevronRight />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Dashboard Principal</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="good-morning-blk">
            <div className="row">
              <div className="col-md-6">
                <div className="morning-user">
                  <h2>
                    Bienvenido, <span>{user?.nombre || ''} {user?.apellido || ''}</span>
                  </h2>
                  <p>Panel de control del sistema de alquileres - {moment().format('DD/MM/YYYY')}</p>
                </div>
              </div>
              <div className="col-md-6 position-blk">
                <div className="morning-img">
                  <img src={morning_img_01} alt="Bienvenida" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Primera fila de widgets */}
          <div className="row">
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="dash-widget">
                <div className="dash-boxs comman-flex-center">
                  <img src={profile_add} alt="Clientes" />
                </div>
                <div className="dash-content dash-count">
                  <h4>Total Clientes</h4>
                  <h2>
                    <CountUp delay={0.4} end={dashboardData.totalClientes} duration={0.6} />
                  </h2>
                  <p>
                    <span className={dashboardData.tendencia.clientes >= 0 ? "passive-view" : "text-danger"}>
                      {renderTendencia(dashboardData.tendencia.clientes)}
                    </span>{" "}
                    vs mes anterior
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="dash-widget">
                <div className="dash-boxs comman-flex-center">
                  <img src={dep_icon1} alt="Espacios" />
                </div>
                <div className="dash-content dash-count">
                  <h4>Espacios Disponibles</h4>
                  <h2>
                    <CountUp delay={0.4} end={dashboardData.espaciosDisponibles} duration={0.6} />
                  </h2>
                  <p>
                    <span className="passive-view">
                      <i className="feather-arrow-up-right me-1">
                        <FaChevronRight />
                      </i>
                      {calcularPorcentaje(dashboardData.espaciosDisponibles, dashboardData.totalEspacios)}%
                    </span>{" "}
                    del total
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="dash-widget">
                <div className="dash-boxs comman-flex-center">
                  <img src={empty_wallet} alt="Ingresos" />
                </div>
                <div className="dash-content dash-count">
                  <h4>Ingresos Mensuales</h4>
                  <h2>
                    S/<CountUp delay={0.4} end={dashboardData.ingresosMensuales} duration={0.6} decimals={2} />
                  </h2>
                  <p>
                    <span className={dashboardData.tendencia.ingresos >= 0 ? "passive-view" : "text-danger"}>
                      {renderTendencia(dashboardData.tendencia.ingresos)}
                    </span>{" "}
                    vs mes anterior
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="dash-widget">
                <div className="dash-boxs comman-flex-center">
                  <img src={calendar} alt="Contratos" />
                </div>
                <div className="dash-content dash-count">
                  <h4>Contratos Activos</h4>
                  <h2>
                    <CountUp delay={0.4} end={dashboardData.contratosActivos} duration={0.6} />
                  </h2>
                  <p>
                    <span className={dashboardData.tendencia.contratos >= 0 ? "passive-view" : "text-danger"}>
                      {renderTendencia(dashboardData.tendencia.contratos)}
                    </span>{" "}
                    vs mes anterior
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Segunda fila de widgets - Nuevos indicadores */}
          <div className="row mb-4">
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Tasa de Ocupación</h5>
                  <div className="text-center my-3">
                    <Progress 
                      type="circle" 
                      percent={calcularPorcentaje(dashboardData.espaciosOcupados, dashboardData.totalEspacios)} 
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  </div>
                  <p className="card-text text-center">
                    {dashboardData.espaciosOcupados} de {dashboardData.totalEspacios} espacios ocupados
                  </p>
                  
                  {dashboardData.datosCrudos?.ocupacion && dashboardData.datosCrudos.ocupacion.length > 0 && (
                    <div className="mt-3" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Inmueble</th>
                            <th>Ocupación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.datosCrudos.ocupacion.map((item, index) => (
                            <tr key={index}>
                              <td title={item.inmueble_nombre}>
                                {item.inmueble_nombre.length > 15 
                                  ? item.inmueble_nombre.substring(0, 13) + '...' 
                                  : item.inmueble_nombre}
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div style={{ width: '60px' }}>
                                    {parseFloat(item.tasa_ocupacion).toFixed(1)}%
                                  </div>
                                  <div className="progress flex-grow-1" style={{ height: '5px' }}>
                                    <div 
                                      className="progress-bar"
                                      style={{ 
                                        width: `${item.tasa_ocupacion}%`,
                                        backgroundColor: parseFloat(item.tasa_ocupacion) > 70 
                                          ? '#52c41a' 
                                          : parseFloat(item.tasa_ocupacion) > 30 
                                            ? '#1890ff' 
                                            : '#ff4d4f'  
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Contratos por Vencer</h5>
                  <div className="d-flex align-items-center justify-content-between">
                    <h2 className="mb-0 text-warning">
                      <CountUp delay={0.4} end={dashboardData.contratosPorVencer} duration={0.6} />
                    </h2>
                    <div className="card-icon bg-warning-light text-warning">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                  </div>
                  <p className="card-text mt-2">
                    Vencen en los próximos 30 días
                  </p>
                  {dashboardData.datosCrudos?.contratosPorVencer && dashboardData.datosCrudos.contratosPorVencer.length > 0 && (
                    <div className="mt-2">
                      <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover">
                          <thead>
                            <tr>
                              <th>Inquilino</th>
                              <th>Espacio</th>
                              <th>Días</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.datosCrudos.contratosPorVencer.slice(0, 3).map(contrato => (
                              <tr key={contrato.id}>
                                <td title={contrato.inquilino_nombre}>{contrato.inquilino_nombre.length > 12 ? contrato.inquilino_nombre.substring(0, 10) + '...' : contrato.inquilino_nombre}</td>
                                <td title={contrato.espacio_nombre}>{contrato.espacio_nombre}</td>
                                <td className={contrato.dias_restantes <= 7 ? 'text-danger' : 'text-warning'}>
                                  {contrato.dias_restantes}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Link to="/contratos-registros" className="btn btn-sm btn-outline-warning w-100 mt-2">
                        Ver todos
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Pagos Pendientes</h5>
                  <div className="d-flex align-items-center justify-content-between">
                    <h2 className="mb-0 text-danger">
                      S/<CountUp delay={0.4} end={dashboardData.pagosPendientes} duration={0.6} decimals={2} />
                    </h2>
                    <div className="card-icon bg-danger-light text-danger">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                  </div>
                  <p className="card-text mt-2">
                    {dashboardData.pagosDelMes.pendientes + dashboardData.pagosDelMes.retrasados > 0 ? 
                      `${dashboardData.pagosDelMes.pendientes + dashboardData.pagosDelMes.retrasados} pagos pendientes este mes` : 
                      'Sin pagos pendientes registrados'
                    }
                  </p>

                  {dashboardData.datosCrudos?.pagos && dashboardData.datosCrudos.pagos.length > 0 && (
                    <div className="mt-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Mes</th>
                            <th>Pagado</th>
                            <th>Pendiente</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.datosCrudos.pagos.slice(0, 4).map((item, index) => {
                            const mes = moment(item.mes).format('MMM-YY');
                            const pagado = parseFloat(item.monto_pagado || 0);
                            const pendiente = parseFloat(item.monto_pendiente || 0);
                            
                            return (
                              <tr key={index}>
                                <td>{mes}</td>
                                <td className="text-success">{pagado > 0 ? `S/ ${pagado.toFixed(2)}` : '-'}</td>
                                <td className={pendiente > 0 ? "text-danger" : "text-muted"}>
                                  {pendiente > 0 ? `S/ ${pendiente.toFixed(2)}` : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <Link to="/pagos-registros" className="btn btn-sm btn-outline-danger w-100 mt-2">
                    Ver todos los pagos
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Acciones Rápidas</h5>
                  <div className="quick-actions">
                    <Link to="/contrato-generar" className="btn btn-sm btn-primary mb-2 w-100">
                      <i className="fas fa-plus-circle me-1"></i> Nuevo Contrato
                    </Link>
                    <Link to="/inmueble-anadir" className="btn btn-sm btn-info mb-2 w-100">
                      <i className="fas fa-building me-1"></i> Añadir Inmueble
                    </Link>
                    <Link to="/inquilinos-registrar" className="btn btn-sm btn-success w-100">
                      <i className="fas fa-user-plus me-1"></i> Registrar Inquilino
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gráficas */}
          <div className="row">
            <div className="col-12 col-md-12 col-lg-6 col-xl-9">
              <div className="card">
                <div className="card-body">
                  <div className="chart-title patient-visit">
                    <h4>Distribución de Espacios</h4>
                    <div>
                      <ul className="nav chat-user-total">
                        <li>
                          <i className="fa fa-circle current-users" aria-hidden="true" />
                          Ocupados {calcularPorcentaje(dashboardData.espaciosOcupados, dashboardData.totalEspacios)}%
                        </li>
                        <li>
                          <i className="fa fa-circle old-users" aria-hidden="true" />{" "}
                          Disponibles {calcularPorcentaje(dashboardData.espaciosDisponibles, dashboardData.totalEspacios)}%
                        </li>
                      </ul>
                    </div>
                    <div className="form-group mb-0">
                      <Select
                        className="custom-react-select"
                        defaultValue={yearOptions[0]}
                        onChange={setSelectedOption}
                        options={yearOptions}
                        id="search-commodity"
                        components={{
                          IndicatorSeparator: () => null
                        }}
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1);',
                            boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
                            '&:hover': {
                              borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
                            },
                            borderRadius: '10px',
                            fontSize: "14px",
                            minHeight: "45px",
                          }),
                          dropdownIndicator: (base, state) => ({
                            ...base,
                            transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                            transition: '250ms',
                            width: '35px',
                            height: '35px',
                          }),
                        }}
                      />
                    </div>
                  </div>
                  <div id="patient-chart">
                    <InquilinosChart 
                      espaciosData={dashboardData.datosCrudos?.espaciosDisponibles || dashboardData.datosCrudos?.ocupacion}
                      selectedYear={selectedOption?.value || currentYear}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-12 col-lg-6 col-xl-3 d-flex">
              <div className="card w-100">
                <div className="card-body">
                  <div className="chart-title">
                    <h4>Estado de Pagos del Mes</h4>
                  </div>
                  <div id="donut-chart-dash" className="chart-user-icon">
                    <DonutChart 
                      completados={dashboardData.pagosDelMes.completados || 0}
                      pendientes={dashboardData.pagosDelMes.pendientes || 0}
                      retrasados={dashboardData.pagosDelMes.retrasados || 0}
                      montoCompletado={dashboardData.datosCrudos?.pagos && dashboardData.datosCrudos.pagos.length > 0 ? 
                        parseFloat(dashboardData.datosCrudos.pagos[0]?.monto_pagado || 0) : 0}
                      montoPendiente={dashboardData.datosCrudos?.pagos && dashboardData.datosCrudos.pagos.length > 0 ? 
                        parseFloat(dashboardData.datosCrudos.pagos[0]?.monto_pendiente || 0) : 0}
                    />
                    <img src={user001} alt="Usuario" />
                  </div>
                  <div className="text-center mt-4">
                    <div className="row">
                      <div className="col-4">
                        <div className="status-item text-success">
                          <strong>{dashboardData.pagosDelMes.completados}</strong>
                          <p>Completados</p>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="status-item text-warning">
                          <strong>{dashboardData.pagosDelMes.pendientes}</strong>
                          <p>Pendientes</p>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="status-item text-danger">
                          <strong>{dashboardData.pagosDelMes.retrasados}</strong>
                          <p>Retrasados</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nuevo gráfico Ingresos vs Gastos */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="chart-title mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4>Análisis Financiero</h4>
                      <div className="form-group m-0" style={{ width: '200px' }}>
                        <Select
                          className="custom-react-select"
                          defaultValue={yearOptions[0]}
                          onChange={setSelectedOption}
                          options={yearOptions}
                          id="search-financial-year"
                          components={{
                            IndicatorSeparator: () => null
                          }}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1);',
                              boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
                              '&:hover': {
                                borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
                              },
                              borderRadius: '10px',
                              fontSize: "14px",
                              minHeight: "40px",
                            }),
                            dropdownIndicator: (base, state) => ({
                              ...base,
                              transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                              transition: '250ms',
                              width: '30px',
                              height: '30px',
                            }),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <IngresosGastosChart
                    ingresos={dashboardData.datosCrudos?.ingresos}
                    gastos={dashboardData.datosCrudos?.gastos}
                    selectedYear={selectedOption?.value || currentYear}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
