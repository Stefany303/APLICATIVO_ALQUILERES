import React, { useState, useEffect, useMemo } from "react";
import { 
  FaChevronRight, 
  FaArrowUp, 
  FaArrowDown, 
  FaHome, 
  FaUsers,
  FaFileContract, 
  FaMoneyBillWave, 
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import IngresosGastosChart from "../Dashboard/IngresosGastosChart";
import TendenciasIngresosChart from "./TendenciasIngresosChart.jsx";
import Select from "react-select";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { useAuth } from "../../utils/AuthContext";
import reporteService from '../../services/reporteService';
import pagoService from '../../services/pagoService';
import { message, Spin, Row, Col, Progress } from 'antd';
import moment from 'moment';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState({
    inquilinos: { activos: 0, total: 0 },
    espacios: { total: 0, ocupados: 0, disponibles: 0 },
    contratosPorVencer: [],
    ingresosMensuales: [],
    ingresosGarantia: 0,
    ingresosMensualesPrevistos: [],
    gastosMensuales: [],
    tendencias: { ingresos: 0, ocupacion: 0 },
    estadisticasPagos: {
      pagados: 0,
      pendientes: 0,
      vencidos: 0,
      cancelados: 0,
      total: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Opciones de año
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString()
  }));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener estadísticas generales y pagos en paralelo
        const [estadisticas, todosLosPagos] = await Promise.all([
          reporteService.obtenerEstadisticasGenerales(),
          pagoService.obtenerPagos()
        ]);

        if (!estadisticas) {
          throw new Error('No se recibieron datos del dashboard');
        }
        
        // Calcular tendencia de ingresos
        const calcularTendenciaIngresos = () => {
          const arr = estadisticas.ingresos_mensuales;
          if (arr && arr.length >= 2) {
            const ingresoActual = parseFloat(arr[0].total_ingresos);
            const ingresoAnterior = parseFloat(arr[1].total_ingresos);
            return ingresoAnterior > 0
              ? ((ingresoActual - ingresoAnterior) / ingresoAnterior) * 100
              : 0;
          }
          return 0;
        };
        
        // Calcular tendencia de ocupación
        const calcularTendenciaOcupacion = () => {
          const esp = estadisticas.espacios;
          if (esp.total > 0) {
            const tasa = (parseInt(esp.ocupados) / esp.total) * 100;
            return tasa;
          }
          return 0;
        };

        // Calcular estadísticas de pagos por estado
        const calcularEstadisticasPagos = () => {
          if (!Array.isArray(todosLosPagos)) {
            return { pagados: 0, pendientes: 0, vencidos: 0, cancelados: 0, total: 0 };
          }

          const estadisticas = todosLosPagos.reduce((acc, pago) => {
            const estado = pago.estado?.toLowerCase();
            acc.total++;
            
            switch (estado) {
              case 'pagado':
                acc.pagados++;
                break;
              case 'pendiente':
                acc.pendientes++;
                break;
              case 'vencido':
                acc.vencidos++;
                break;
              case 'cancelado':
                acc.cancelados++;
                break;
              default:
                // Estados no reconocidos se cuentan en total pero no en categorías específicas
                break;
            }
            
            return acc;
          }, { pagados: 0, pendientes: 0, vencidos: 0, cancelados: 0, total: 0 });

          return estadisticas;
        };

        // Estructurar datos
        const newDashboardData = {
          inquilinos: {
            activos: estadisticas.inquilinos.activos,
            total: estadisticas.inquilinos.total
          },
          espacios: {
            total: parseInt(estadisticas.espacios.total),
            ocupados: parseInt(estadisticas.espacios.ocupados),
            disponibles: parseInt(estadisticas.espacios.disponibles)
          },
          contratosPorVencer: estadisticas.contratos_por_vencer,
          ingresosMensuales: estadisticas.ingresos_mensuales.map(item => ({
            mes: item.mes,
            total_ingresos: parseFloat(item.total_ingresos)
          })),
          ingresosGarantia: parseFloat(estadisticas.ingresos_garantia?.[0]?.total_ingresos_garantia || 0),
          ingresosMensualesPrevistos: estadisticas.ingresos_mensuales_previstos.map(item => ({
            mes: item.mes,
            total_ingresos: parseFloat(item.total_ingresos)
          })),
          gastosMensuales: estadisticas.gastos_mensuales.map(item => ({
            mes: item.mes,
            total_gastos: parseFloat(item.total_gastos)
          })),
          tendencias: {
            ingresos: calcularTendenciaIngresos(),
            ocupacion: calcularTendenciaOcupacion()
          },
          estadisticasPagos: calcularEstadisticasPagos()
        };

        setDashboardData(newDashboardData);
      } catch (err) {
        setError({
          message: 'Error al cargar los datos del dashboard',
          details: err.response?.data || err.message
        });
        message.error('Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Render de flecha de tendencia
  const renderTendencia = (valor) => {
    if (valor > 0) {
      return <span className="tendencia-positiva"><FaArrowUp /> {valor.toFixed(1)}%</span>;
    } else if (valor < 0) {
      return <span className="tendencia-negativa"><FaArrowDown /> {Math.abs(valor).toFixed(1)}%</span>;
    }
    return <span>0%</span>;
  };

  // Calcular porcentaje
  const calcularPorcentaje = (valor, total) => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  // Filtrar datos por año
  const {
    ingresosFiltrados,
    ingresosPrevistosFiltrados,
    gastosFiltrados
  } = useMemo(() => {
    const extraerAño = mesStr => parseInt(mesStr.split("-")[0], 10);

    const ingresosHist = dashboardData.ingresosMensuales
      .filter(item => extraerAño(item.mes) === selectedYear)
      .sort((a, b) => a.mes.localeCompare(b.mes));

    const ingresosPrev = dashboardData.ingresosMensualesPrevistos
      .filter(item => extraerAño(item.mes) === selectedYear)
      .sort((a, b) => a.mes.localeCompare(b.mes));

    const gastos = dashboardData.gastosMensuales
      .filter(item => extraerAño(item.mes) === selectedYear)
      .sort((a, b) => a.mes.localeCompare(b.mes));

    return {
      ingresosFiltrados: ingresosHist,
      ingresosPrevistosFiltrados: ingresosPrev,
      gastosFiltrados: gastos
    };
  }, [dashboardData, selectedYear]);

  // Calcular el ingreso del mes actual
  const mesActual = moment().format('YYYY-MM');
  const ingresoMesActual = dashboardData.ingresosMensuales.find(item => item.mes === mesActual)?.total_ingresos || 0;

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
              <pre className="mt-3">{JSON.stringify(error.details, null, 2)}</pre>
            )}
            <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
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
      <Sidebar id="menu-item" id1="menu-items" activeClassName="admin-dashboard" />

      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <Row>
              <Col span={24}>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i><FaChevronRight /></i>
                  </li>
                  <li className="breadcrumb-item active">Dashboard Principal</li>
                </ul>
              </Col>
            </Row>
              </div>
          
          <div className="dashboard-header">
            <div className="welcome-section">
              <div className="welcome-text">
                <h2>Bienvenido, <span>{user?.nombre || ''} {user?.apellido || ''}</span></h2>
                  <p>Panel de control del sistema de alquileres - {moment().format('DD/MM/YYYY')}</p>
                </div>
              <div className="dashboard-actions">
                <div className="year-selector">
                  <span>Seleccionar año:</span>
                  <Select
                    options={yearOptions}
                    value={{ value: selectedYear, label: selectedYear.toString() }}
                    onChange={(option) => setSelectedYear(option.value)}
                    className="year-select"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        minHeight: '40px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#4361ee'
                        }
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="kpi-grid">
            <div className="kpi-card clientes-card">
              <div className="kpi-icon">
                <FaUsers />
                </div>
              <div className="kpi-content">
                  <h4>Total Clientes</h4>
                  <h2>
                  <CountUp end={dashboardData.inquilinos.total} duration={0.6} />
                  </h2>
                  <p>
                  <span className="kpi-subtext">
                    {dashboardData.inquilinos.activos} activos
                  </span>
                  </p>
                </div>
              </div>

            <div className="kpi-card espacios-card">
              <div className="kpi-icon">
                <FaHome />
            </div>
              <div className="kpi-content">
                  <h4>Espacios Disponibles</h4>
                  <h2>
                  <CountUp end={dashboardData.espacios.disponibles} duration={0.6} />
                  </h2>
                  <p>
                  <span className="kpi-subtext">
                    {calcularPorcentaje(dashboardData.espacios.disponibles, dashboardData.espacios.total)}% del total
                  </span>
                  </p>
                </div>
              </div>

            <div className="kpi-card ingresos-card">
              <div className="kpi-icon">
                <FaMoneyBillWave />
            </div>
              <div className="kpi-content">
                  <h4>Ingresos Mensuales</h4>
                  <h2>
                  S/<CountUp 
                    end={ingresoMesActual}
                    duration={0.6}
                    decimals={2}
                  />
                  </h2>
                  <p>
                  {renderTendencia(dashboardData.tendencias.ingresos)} vs mes anterior
                  </p>
                </div>
              </div>

            <div className="kpi-card contratos-card">
              <div className="kpi-icon">
                <FaExclamationTriangle />
            </div>
              <div className="kpi-content">
                <h4>Pagos Vencidos</h4>
                <h2>
                  <CountUp end={dashboardData.estadisticasPagos.vencidos} duration={0.6} />
                  {dashboardData.estadisticasPagos.vencidos > 0 && (
                    <span className="pulse-alert">!</span>
                  )}
                  </h2>
                <p>
                  <span className="kpi-subtext">
                    {dashboardData.estadisticasPagos.vencidos > 0 
                      ? "Requieren atención inmediata" 
                      : "Todo al día"}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="dashboard-widgets">
            <div className="widget-card">
              <div className="widget-header">
                <FaMoneyBillWave className="widget-icon" />
                <h3>Estado de Pagos</h3>
              </div>
              <div className="widget-content">
                <div className="pagos-grid">
                  <div className="pago-stat pagado">
                    <div className="pago-icon">✓</div>
                    <div className="pago-info">
                      <span className="pago-count">{dashboardData.estadisticasPagos.pagados}</span>
                      <span className="pago-label">Pagados</span>
                    </div>
                  </div>
                  
                  <div className="pago-stat pendiente">
                    <div className="pago-icon">⏱</div>
                    <div className="pago-info">
                      <span className="pago-count">{dashboardData.estadisticasPagos.pendientes}</span>
                      <span className="pago-label">Pendientes</span>
                    </div>
                  </div>
                  
                  <div className="pago-stat vencido">
                    <div className="pago-icon">⚠</div>
                    <div className="pago-info">
                      <span className="pago-count">{dashboardData.estadisticasPagos.vencidos}</span>
                      <span className="pago-label">Vencidos</span>
                    </div>
                  </div>
                  
                  <div className="pago-stat cancelado">
                    <div className="pago-icon">✕</div>
                    <div className="pago-info">
                      <span className="pago-count">{dashboardData.estadisticasPagos.cancelados}</span>
                      <span className="pago-label">Cancelados</span>
                    </div>
                  </div>
                </div>
                
                <div className="pagos-summary">
                  <div className="summary-item">
                    <span>Total de Pagos: </span>
                    <strong>{dashboardData.estadisticasPagos.total}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Tasa de Cumplimiento: </span>
                    <strong>
                      {dashboardData.estadisticasPagos.total > 0 
                        ? Math.round((dashboardData.estadisticasPagos.pagados / dashboardData.estadisticasPagos.total) * 100)
                        : 0
                      }%
                    </strong>
                  </div>
                </div>
                
                <Link to="/reporte-pagos" className="widget-link">
                  Ver reporte completo <FaChevronRight />
                </Link>
              </div>
            </div>

            <div className="widget-card">
              <div className="widget-header">
                <FaHome className="widget-icon" />
                <h3>Tasa de Ocupación</h3>
              </div>
              <div className="widget-content">
                <div className="ocupacion-progress">
                    <Progress 
                      type="circle" 
                    percent={calcularPorcentaje(
                      dashboardData.espacios.ocupados,
                      dashboardData.espacios.total
                    )}
                      strokeColor={{
                      '0%': '#4361ee',
                      '100%': '#06d6a0'
                      }}
                    strokeWidth={10}
                    width={150}
                    format={percent => `${percent}%`}
                    />
                  <div className="ocupacion-stats">
                    <div className="stat-item">
                      <span className="stat-label">Ocupados</span>
                      <span className="stat-value">{dashboardData.espacios.ocupados}</span>
                  </div>
                    <div className="stat-item">
                      <span className="stat-label">Disponibles</span>
                      <span className="stat-value">{dashboardData.espacios.disponibles}</span>
                                  </div>
                    <div className="stat-item">
                      <span className="stat-label">Total</span>
                      <span className="stat-value">{dashboardData.espacios.total}</span>
                                  </div>
                                </div>
                </div>
                <div className="tendencia-ocupacion">
                  <span>Tendencia: </span>
                  {renderTendencia(dashboardData.tendencias.ocupacion - 
                    calcularPorcentaje(
                      dashboardData.espacios.ocupados,
                      dashboardData.espacios.total
                  ))}
                    </div>
                </div>
              </div>

            <div className="widget-card">
              <div className="widget-header">
                <FaFileContract className="widget-icon" />
                <h3>Contratos por Vencer</h3>
            </div>
              <div className="widget-content">
                <div className="contratos-summary">
                  <div className="contratos-count">
                    <span className="count">{dashboardData.contratosPorVencer.length}</span>
                    <span>contratos próximos a vencer</span>
                    </div>
                  <div className="contratos-warning">
                    <FaExclamationTriangle className="warning-icon" />
                    <span>Revise los detalles</span>
                  </div>
                </div>
                
                {dashboardData.contratosPorVencer.length > 0 ? (
                  <div className="contratos-table">
                    <table>
                          <thead>
                            <tr>
                              <th>Inquilino</th>
                              <th>Espacio</th>
                              <th>Días</th>
                            </tr>
                          </thead>
                          <tbody>
                        {dashboardData.contratosPorVencer.slice(0, 5).map((contrato) => (
                              <tr key={contrato.id}>
                            <td title={contrato.inquilino_nombre}>
                              {contrato.inquilino_nombre.length > 15
                                ? contrato.inquilino_nombre.substring(0, 12) + "..."
                                : contrato.inquilino_nombre}
                            </td>
                                <td title={contrato.espacio_nombre}>{contrato.espacio_nombre}</td>
                            <td className={contrato.dias_restantes <= 7 ? "dias-peligro" : "dias-advertencia"}>
                                  {contrato.dias_restantes}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                ) : (
                  <div className="no-contratos">
                    <p>No hay contratos próximos a vencer</p>
                    </div>
                  )}
                
                <Link to="/contrato-registros" className="widget-link">
                  Ver todos los contratos <FaChevronRight />
                </Link>
                </div>
              </div>

            <div className="widget-card">
              <div className="widget-header">
                <FaMoneyBillWave className="widget-icon" />
                <h3>Pagos Registrados (Mes)</h3>
            </div>
              <div className="widget-content">
                <div className="ingresos-summary">
                  <div className="ingresos-amount">
                    S/<CountUp
                      end={ingresoMesActual}
                      duration={0.6}
                      decimals={2}
                    />
                    </div>
                  <div className="ingresos-tendencia">
                    {renderTendencia(dashboardData.tendencias.ingresos)}
                  </div>
                </div>
                
                <div className="ingresos-history">
                  <h4>Historial de ingresos</h4>
                  <div className="history-bars">
                    {dashboardData.ingresosMensuales.slice(0, 6).reverse().map((item, index) => {
                      const mesFormateado = moment(item.mes, "YYYY-MM").format("MMM");
                      const maxVal = Math.max(...dashboardData.ingresosMensuales.map(i => i.total_ingresos), 1000);
                      const height = (item.total_ingresos / maxVal) * 100;
                            
                            return (
                        <div className="bar-container" key={index}>
                          <div className="bar-label">{mesFormateado}</div>
                          <div className="bar-bg">
                            <div 
                              className="bar-fill" 
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                          <div className="bar-value">S/{item.total_ingresos.toFixed(0)}</div>
                        </div>
                            );
                          })}
                    </div>
                </div>

                <Link to="/contabilidad-pagos" className="widget-link">
                  Ver todos los ingresos <FaChevronRight />
                  </Link>
              </div>
            </div>
          </div>
          
          <div className="charts-container">
            <div className="chart-card">
              <div className="chart-header">
                <FaChartLine className="chart-icon" />
                <h3>Tendencias de Ingresos</h3>
                    </div>
              <div className="chart-content">
                <TendenciasIngresosChart
                  ingresos={ingresosFiltrados}
                  ingresosPrevistos={ingresosPrevistosFiltrados}
                  selectedYear={selectedYear}
                />
            </div>
          </div>

            <div className="chart-card">
              <div className="chart-header">
                <FaChartLine className="chart-icon" />
                <h3>Análisis Financiero</h3>
                      </div>
              <div className="chart-content">
                  <IngresosGastosChart
                  ingresos={ingresosFiltrados}
                  ingresosPrevistos={ingresosPrevistosFiltrados}
                  gastos={gastosFiltrados}
                  selectedYear={selectedYear}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      <style jsx>{`
        .page-wrapper {
          background-color: #f5f8fa;
          min-height: 100vh;
          padding-bottom: 40px;
        }
        
        .content {
          padding: 20px 20px 40px 20px;
          margin: 0;
        }
        
        .breadcrumb {
          background: transparent;
          padding: 0;
          margin-bottom: 20px;
        }
        
        .dashboard-header {
          background: linear-gradient(135deg, #3f51b5 0%, #283593 100%);
          border-radius: 12px;
          padding: 25px 30px;
          margin-bottom: 25px;
          color: white;
          box-shadow: 0 10px 20px rgba(67, 97, 238, 0.15);
        }
        
        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .welcome-text h2 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .welcome-text h2 span {
          color: #ffd166;
        }
        
        .welcome-text p {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
        }
        
        .dashboard-actions {
          display: flex;
          align-items: center;
        }
        
        .year-selector {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          padding: 8px 15px;
          border-radius: 12px;
        }
        
        .year-selector span {
          margin-right: 10px;
          font-size: 14px;
        }
        
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }
        
        .kpi-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          border-left: 4px solid;
        }
        
        .kpi-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .clientes-card { border-left-color: #7e57c2; }
        .espacios-card { border-left-color: #42a5f5; }
        .ingresos-card { border-left-color: #66bb6a; }
        .contratos-card { border-left-color: #ffa726; }
        
        .kpi-icon {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 24px;
          color: white;
        }
        
        .clientes-card .kpi-icon {
          background: linear-gradient(135deg, #7209b7 0%, #3a0ca3 100%);
        }
        
        .espacios-card .kpi-icon {
          background: linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%);
        }
        
        .ingresos-card .kpi-icon {
          background: linear-gradient(135deg, #06d6a0 0%, #118ab2 100%);
        }
        
        .contratos-card .kpi-icon {
          background: linear-gradient(135deg, #ef476f 0%, #dc3545 100%);
        }
        
        .kpi-content h4 {
          font-size: 16px;
          color: #6c757d;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .kpi-content h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 5px;
          color: #212529;
        }
        
        .kpi-subtext {
          font-size: 14px;
          color: #6c757d;
        }
        
        .dashboard-widgets {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }
        
        .widget-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          border-top: 3px solid;
        }
        
        .widget-card:nth-child(1) { border-top-color: #66bb6a; }
        .widget-card:nth-child(2) { border-top-color: #42a5f5; }
        .widget-card:nth-child(3) { border-top-color: #ffa726; }
        .widget-card:nth-child(4) { border-top-color: #ef476f; }
        
        .widget-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .widget-header {
          display: flex;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .widget-icon {
          font-size: 20px;
          margin-right: 12px;
          color: #4361ee;
        }
        
        .widget-header h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #212529;
        }
        
        .widget-content {
          padding: 20px;
        }
        
        .ocupacion-progress {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin-bottom: 20px;
        }
        
        .ocupacion-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        
        .stat-label {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #212529;
        }
        
        .tendencia-ocupacion {
          text-align: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 10px;
          font-weight: 500;
        }
        
        .contratos-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .contratos-count {
          display: flex;
          flex-direction: column;
        }
        
        .contratos-count .count {
          font-size: 32px;
          font-weight: 700;
          color: #ef476f;
          line-height: 1;
        }
        
        .contratos-warning {
          display: flex;
          align-items: center;
          background: #fff9db;
          padding: 8px 15px;
          border-radius: 30px;
          color: #e67700;
          font-weight: 500;
        }
        
        .warning-icon {
          margin-right: 8px;
          font-size: 18px;
        }
        
        .contratos-table {
          margin-bottom: 20px;
        }
        
        .contratos-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .contratos-table th {
          background: #f8f9fa;
          padding: 10px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #e9ecef;
        }
        
        .contratos-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #e9ecef;
          color: #495057;
        }
        
        .dias-peligro {
          color: #ef476f;
          font-weight: 600;
        }
        
        .dias-advertencia {
          color: #ff9e00;
          font-weight: 600;
        }
        
        .no-contratos {
          text-align: center;
          padding: 30px 0;
          color: #6c757d;
        }
        
        .pagos-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .pago-stat {
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .pago-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .pago-stat.pagado {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border-left: 4px solid #28a745;
        }
        
        .pago-stat.pendiente {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border-left: 4px solid #ffc107;
        }
        
        .pago-stat.vencido {
          background: linear-gradient(135deg, #f8d7da 0%, #f1c2c7 100%);
          border-left: 4px solid #dc3545;
        }
        
        .pago-stat.cancelado {
          background: linear-gradient(135deg, #e2e3e5 0%, #d1d3d4 100%);
          border-left: 4px solid #6c757d;
        }
        
        .pago-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          margin-right: 12px;
        }
        
        .pago-stat.pagado .pago-icon {
          background: #28a745;
          color: white;
        }
        
        .pago-stat.pendiente .pago-icon {
          background: #ffc107;
          color: white;
        }
        
        .pago-stat.vencido .pago-icon {
          background: #dc3545;
          color: white;
        }
        
        .pago-stat.cancelado .pago-icon {
          background: #6c757d;
          color: white;
        }
        
        .pago-info {
          display: flex;
          flex-direction: column;
        }
        
        .pago-count {
          font-size: 24px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .pago-stat.pagado .pago-count { color: #155724; }
        .pago-stat.pendiente .pago-count { color: #856404; }
        .pago-stat.vencido .pago-count { color: #721c24; }
        .pago-stat.cancelado .pago-count { color: #495057; }
        
        .pago-label {
          font-size: 14px;
          font-weight: 500;
          opacity: 0.8;
        }
        
        .pagos-summary {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .summary-item:last-child {
          margin-bottom: 0;
        }
        
        .summary-item span {
          color: #6c757d;
          font-size: 14px;
        }
        
        .summary-item strong {
          color: #495057;
          font-size: 16px;
        }
        
        .ingresos-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .ingresos-amount {
          font-size: 28px;
          font-weight: 700;
          color: #06d6a0;
        }
        
        .ingresos-tendencia {
          font-size: 16px;
          font-weight: 500;
        }
        
        .ingresos-history h4 {
          font-size: 16px;
          color: #6c757d;
          margin-bottom: 15px;
        }
        
        .history-bars {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 180px;
          margin-bottom: 20px;
        }
        
        .bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 14%;
        }
        
        .bar-label {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 8px;
        }
        
        .bar-bg {
          height: 120px;
          width: 20px;
          background: #f1f3f9;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
        }
        
        .bar-fill {
          width: 100%;
          background: linear-gradient(180deg, #5c6bc0 0%, #3949ab 100%);
          border-radius: 4px 4px 0 0;
          transition: height 0.5s ease;
        }
        
        .bar-value {
          font-size: 12px;
          margin-top: 8px;
          font-weight: 500;
          color: #495057;
        }
        
        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }
        
        .chart-card {
          background: #f6f8fa;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.3s ease;
          border-top: 3px solid #5c6bc0;
          border: 1px solid #e0e0e0;
        }
        
        .chart-card:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .chart-header {
          display: flex;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .chart-icon {
          font-size: 20px;
          margin-right: 12px;
          color: #4361ee;
        }
        
        .chart-header h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #212529;
        }
        
        .chart-content {
          padding: 20px;
          height: 500px;
        }
        
        .widget-link {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
          color: #4361ee;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .widget-link:hover {
          background: #edf2ff;
          color: #3a0ca3;
        }
        
        .widget-link svg {
          margin-left: 8px;
          font-size: 12px;
        }
        
        .tendencia-positiva {
          color: #06d6a0;
          font-weight: 500;
          display: flex;
          align-items: center;
          background: rgba(102, 187, 106, 0.15);
          padding: 2px 8px;
          border-radius: 12px;
        }
        
        .tendencia-negativa {
          color: #ef476f;
          font-weight: 500;
          display: flex;
          align-items: center;
          background: rgba(239, 71, 111, 0.15);
          padding: 2px 8px;
          border-radius: 12px;
        }
        
        .pulse-alert {
          color: #dc3545;
          font-size: 16px;
          margin-left: 8px;
          animation: pulse-red 1.5s infinite;
          font-weight: bold;
        }
        
        @keyframes pulse-red {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @media (max-width: 992px) {
          .dashboard-widgets {
            grid-template-columns: 1fr;
          }
          
          .charts-container {
            grid-template-columns: 1fr;
          }
          
          .ocupacion-progress {
            flex-direction: column;
            gap: 20px;
          }
          
          .pagos-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
        
        @media (max-width: 768px) {
          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .dashboard-actions {
            width: 100%;
          }
          
          .year-selector {
            width: 100%;
          }
          
          .history-bars {
            height: 150px;
          }
          
          .bar-bg {
            height: 100px;
          }
          
          .kpi-card {
            flex-direction: column;
            text-align: center;
          }
          
          .kpi-icon {
            margin-right: 0;
            margin-bottom: 15px;
          }
        }
        
        @media (max-width: 576px) {
          .content {
            padding: 15px;
          }
          
          .kpi-grid {
            grid-template-columns: 1fr;
          }
          
          .chart-content {
            height: 300px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminDashboard;