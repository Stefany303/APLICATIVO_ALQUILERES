import React, { useState, useEffect } from "react";
import DonutChart from "../Dashboard//DonutChart";
import { FaChevronRight } from 'react-icons/fa';
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

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedOption, setSelectedOption] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalClientes: 0,
    espaciosOcupados: 0,
    espaciosDisponibles: 0,
    ingresosMensuales: 0,
    pagosPendientes: 0,
    contratosActivos: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [year, setyear] = useState([
    { value: 1, label: "2024" },
    { value: 2, label: "2023" },
    { value: 3, label: "2022" },
    { value: 4, label: "2021" },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener total de clientes
        const personas = await personaService.obtenerPersonas();
        const totalClientes = personas.length;

        // Obtener datos de inmuebles y espacios
        const inmuebles = await inmuebleService.obtenerInmuebles();
        let espaciosOcupados = 0;
        let espaciosDisponibles = 0;
        let ingresosMensuales = 0;
        let contratosActivos = 0;

        // Iterar sobre cada inmueble para obtener sus espacios
        for (const inmueble of inmuebles) {
          const pisos = inmueble.pisos || [];
          for (const piso of pisos) {
            const espacios = await espacioService.obtenerEspaciosPorPiso(inmueble.id, piso.id);
            espacios.forEach(espacio => {
              if (espacio.estado === 'OCUPADO') {
                espaciosOcupados++;
                if (espacio.contrato) {
                  contratosActivos++;
                  ingresosMensuales += espacio.contrato.montoMensual || 0;
                }
              } else if (espacio.estado === 'DISPONIBLE') {
                espaciosDisponibles++;
              }
            });
          }
        }

        setDashboardData({
          totalClientes,
          espaciosOcupados,
          espaciosDisponibles,
          ingresosMensuales,
          pagosPendientes: 0, // TODO: Implementar cuando tengamos el servicio de pagos
          contratosActivos
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
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
            {error}
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
                      <FaChevronRight icon="chevron-right" />
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
                    Bienvenido, <span>{user.nombre} {user.apellido}</span>
                  </h2>
                  <p>Panel de control del sistema de alquileres</p>
                </div>
              </div>
              <div className="col-md-6 position-blk">
                <div className="morning-img">
                  <img src={morning_img_01} alt="#" />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="dash-widget">
                <div className="dash-boxs comman-flex-center">
                  <img src={profile_add} alt="#" />
                </div>
                <div className="dash-content dash-count">
                  <h4>Total Clientes</h4>
                  <h2>
                    <CountUp delay={0.4} end={dashboardData.totalClientes} duration={0.6} />
                  </h2>
                  <p>
                    <span className="passive-view">
                      <i className="feather-arrow-up-right me-1">
                        <FaChevronRight icon="arrow-up-right" />
                      </i>
                      {Math.round((dashboardData.totalClientes / (dashboardData.totalClientes + 1)) * 100)}%
                    </span>{" "}
                    vs mes anterior
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="dash-widget">
                <div className="dash-boxs comman-flex-center">
                  <img src={dep_icon1} alt="#" />
                </div>
                <div className="dash-content dash-count">
                  <h4>Espacios Disponibles</h4>
                  <h2>
                    <CountUp delay={0.4} end={dashboardData.espaciosDisponibles} duration={0.6} />
                  </h2>
                  <p>
                    <span className="passive-view">
                      <i className="feather-arrow-up-right me-1">
                        <FaChevronRight icon="arrow-up-right" />
                      </i>
                      {Math.round((dashboardData.espaciosDisponibles / (dashboardData.espaciosOcupados + dashboardData.espaciosDisponibles)) * 100)}%
                    </span>{" "}
                    del total
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="dash-widget">
                <div className="dash-boxs comman-flex-center">
                  <img src={empty_wallet} alt="#" />
                </div>
                <div className="dash-content dash-count">
                  <h4>Ingresos Mensuales</h4>
                  <h2>
                    $<CountUp delay={0.4} end={dashboardData.ingresosMensuales} duration={0.6} />
                  </h2>
                  <p>
                    <span className="passive-view">
                      <i className="feather-arrow-up-right me-1">
                        <FaChevronRight icon="arrow-up-right" />
                      </i>
                      {Math.round((dashboardData.ingresosMensuales / (dashboardData.ingresosMensuales + 1)) * 100)}%
                    </span>{" "}
                    vs mes anterior
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
              <div className="dash-widget">
                <div className="dash-boxs comman-flex-center">
                  <img src={calendar} alt="#" />
                </div>
                <div className="dash-content dash-count">
                  <h4>Contratos Activos</h4>
                  <h2>
                    <CountUp delay={0.4} end={dashboardData.contratosActivos} duration={0.6} />
                  </h2>
                  <p>
                    <span className="passive-view">
                      <i className="feather-arrow-up-right me-1">
                        <FaChevronRight icon="arrow-up-right" />
                      </i>
                      {Math.round((dashboardData.contratosActivos / (dashboardData.contratosActivos + 1)) * 100)}%
                    </span>{" "}
                    vs mes anterior
                  </p>
                </div>
              </div>
            </div>
          </div>
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
                          Ocupados {Math.round((dashboardData.espaciosOcupados / (dashboardData.espaciosOcupados + dashboardData.espaciosDisponibles)) * 100)}%
                        </li>
                        <li>
                          <i className="fa fa-circle old-users" aria-hidden="true" />{" "}
                          Disponibles {Math.round((dashboardData.espaciosDisponibles / (dashboardData.espaciosOcupados + dashboardData.espaciosDisponibles)) * 100)}%
                        </li>
                      </ul>
                    </div>
                    <div className="form-group mb-0">
                      <Select
                        className="custom-react-select"
                        defaultValue={selectedOption}
                        onChange={setSelectedOption}
                        options={year}
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
                  <div id="patient-chart" />
                  <InquilinosChart />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-12 col-lg-6 col-xl-3 d-flex">
              <div className="card">
                <div className="card-body">
                  <div className="chart-title">
                    <h4>Estado de Pagos</h4>
                  </div>
                  <div id="donut-chart-dash" className="chart-user-icon">
                    <DonutChart />
                    <img src={user001} alt="#" />
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
