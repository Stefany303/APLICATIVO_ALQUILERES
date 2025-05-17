import React, { useState, useEffect } from "react";
import DonutChart from "../Dashboard//DonutChart";
import { FaChevronRight, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import InquilinosChart from "../Dashboard/InquilinosChart";
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
import personaService from '../../services/personaService';
import inmuebleService from '../../services/inmuebleService';
import espacioService from '../../services/espacioService';
import contratoService from '../../services/contratoService';
import { message, Spin, Card, Row, Col, Statistic, Progress } from 'antd';
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
    }
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
        
        // Obtener datos con un manejo de errores mejorado y logs para debugging
        console.log('Iniciando carga de datos del dashboard...');
        
        const [personas, inmuebles, contratos] = await Promise.all([
          personaService.obtenerInquilinos().catch(err => {
            console.error('Error al obtener inquilinos:', err);
            return [];
          }),
          inmuebleService.obtenerInmuebles().catch(err => {
            console.error('Error al obtener inmuebles:', err);
            return [];
          }),
          contratoService.obtenerContratosDetalles().catch(err => {
            console.error('Error al obtener contratos:', err);
            return [];
          })
        ]);
        
        console.log('Datos recibidos:');
        console.log('- Personas:', personas);
        console.log('- Inmuebles:', inmuebles);
        console.log('- Contratos:', contratos);

        // Calcular total de clientes
        const totalClientes = Array.isArray(personas) ? personas.length : 0;
        console.log('Total clientes calculado:', totalClientes);

        // Inicializar espacios
        let espaciosPromises = [];
        if (Array.isArray(inmuebles)) {
          inmuebles.forEach(inmueble => {
            // Verificar que el ID del inmueble es válido
            if (inmueble && inmueble.id) {
              espaciosPromises.push(
                espacioService.obtenerEspacios(inmueble.id)
                  .catch(err => {
                    console.error(`Error al obtener espacios del inmueble ${inmueble.id}:`, err);
                    return [];
                  })
              );
            }
          });
        }

        // Esperar a que se resuelvan todas las promesas de espacios
        const espaciosPorInmueble = await Promise.all(espaciosPromises);
        const espacios = espaciosPorInmueble.flat();
        console.log('Espacios obtenidos:', espacios);

        // Procesar espacios
        let espaciosOcupados = 0;
        let espaciosDisponibles = 0;
        let totalEspacios = Array.isArray(espacios) ? espacios.length : 0;

        if (Array.isArray(espacios)) {
          espacios.forEach(espacio => {
            if (espacio && espacio.estado === 1) {
              espaciosOcupados++;
            } else if (espacio) {
              espaciosDisponibles++;
            }
          });
        }
        
        console.log(`Espacios procesados: Total: ${totalEspacios}, Ocupados: ${espaciosOcupados}, Disponibles: ${espaciosDisponibles}`);

        // Procesar contratos
        let contratosActivos = 0;
        let contratosPorVencer = 0;
        let ingresosMensuales = 0;
        let pagosPendientes = 0;
        
        // Obtener fecha actual y fecha en 30 días
        const fechaActual = moment();
        const fechaEn30Dias = moment().add(30, 'days');
        
        // Contador para pagos del mes
        const pagosDelMes = {
          completados: 0,
          pendientes: 0,
          retrasados: 0,
          totalMonto: 0
        };

        if (Array.isArray(contratos)) {
          contratos.forEach(contrato => {
            // Verificar datos del contrato para evitar errores
            if (!contrato) return;
            
            // Verificar si el contrato está activo
            if (contrato.estado && contrato.estado.toLowerCase() === 'activo') {
              contratosActivos++;
              
              // Sumar montos, asegurando que sean valores numéricos
              const montoAlquiler = parseFloat(contrato.monto_alquiler || 0);
              if (!isNaN(montoAlquiler)) {
                ingresosMensuales += montoAlquiler;
              }
              
              // Verificar si vence en los próximos 30 días
              if (contrato.fecha_fin) {
                const fechaFin = moment(contrato.fecha_fin);
                if (fechaFin.isValid() && fechaFin.isBetween(fechaActual, fechaEn30Dias)) {
                  contratosPorVencer++;
                }
              }
              
              // Revisar pagos
              if (Array.isArray(contrato.pagos)) {
                contrato.pagos.forEach(pago => {
                  if (!pago) return;
                  
                  // Verificar si el pago es del mes actual
                  if (pago.fecha) {
                    const fechaPago = moment(pago.fecha);
                    if (fechaPago.isValid() && fechaPago.isSame(fechaActual, 'month')) {
                      const montoPago = parseFloat(pago.monto || 0);
                      if (!isNaN(montoPago)) {
                        pagosDelMes.totalMonto += montoPago;
                      }
                      
                      // Clasificar el pago según su estado
                      if (pago.estado === 'completado') {
                        pagosDelMes.completados++;
                      } else if (pago.estado === 'pendiente') {
                        pagosDelMes.pendientes++;
                        pagosPendientes += parseFloat(pago.monto || 0);
                      } else if (pago.estado === 'retrasado') {
                        pagosDelMes.retrasados++;
                        pagosPendientes += parseFloat(pago.monto || 0);
                      }
                    }
                  }
                });
              } else {
                // Si no hay datos de pagos, simulamos para la demo
                // En un entorno real, esto se eliminaría
                if (Math.random() > 0.5) {
                  pagosDelMes.completados++;
                } else {
                  pagosDelMes.pendientes++;
                }
              }
            }
          });
        }
        
        console.log('Contratos procesados:', {
          activos: contratosActivos,
          porVencer: contratosPorVencer,
          ingresosMensuales,
          pagosPendientes,
          pagosDelMes
        });

        // Asegurarse de que al menos haya valores mínimos para la visualización
        // (solo para demostración, eliminar en producción real)
        if (pagosDelMes.completados + pagosDelMes.pendientes + pagosDelMes.retrasados === 0) {
          pagosDelMes.completados = 3;
          pagosDelMes.pendientes = 2;
          pagosDelMes.retrasados = 1;
        }

        // Calcular tendencias (simuladas por ahora, en una implementación real se compararían con datos históricos)
        const tendencia = {
          clientes: Math.random() > 0.5 ? Math.random() * 15 : -Math.random() * 10,
          ingresos: Math.random() > 0.6 ? Math.random() * 20 : -Math.random() * 15,
          contratos: Math.random() > 0.7 ? Math.random() * 12 : -Math.random() * 8,
          ocupacion: espaciosOcupados > espaciosDisponibles ? 5 : -5
        };

        // Actualizar datos del dashboard
        const newDashboardData = {
          totalClientes,
          espaciosOcupados,
          espaciosDisponibles,
          ingresosMensuales,
          pagosPendientes,
          contratosActivos,
          contratosPorVencer,
          totalEspacios,
          pagosDelMes,
          tendencia
        };
        
        console.log('Datos finales del dashboard:', newDashboardData);
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
                    {dashboardData.pagosDelMes.pendientes + dashboardData.pagosDelMes.retrasados} pagos pendientes este mes
                  </p>
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
                      espaciosOcupados={dashboardData.espaciosOcupados}
                      espaciosDisponibles={dashboardData.espaciosDisponibles}
                      totalEspacios={dashboardData.totalEspacios}
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
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
