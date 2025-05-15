/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { Table } from 'antd';
import { blogimg10, blogimg12, blogimg2, blogimg6, blogimg8, imagesend, pdficon, pdficon2, pdficon3, pdficon4, plusicon, refreshicon, searchnormal } from '../../components/imagepath';
import { DatePicker, Space } from 'antd';
import { FiChevronRight } from "react-icons/fi";
import {onShowSizeChange,itemRender}from  '../../components/Pagination'
import Select from "react-select";
import reporteService from '../../services/reporteService';
import inmuebleService from '../../services/inmuebleService';
import moment from 'moment';

const ReporteGastos = () => {
    const [inmuebles, setInmuebles] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [filtros, setFiltros] = useState({
        fecha_inicio: '',
        fecha_fin: '',
        inmueble_id: '',
        tipo_gasto: ''
    });

    // Tipos de gastos
    const [tipoGastos, setTipoGastos] = useState([
        { value: '', label: "Todos los tipos" },
        { value: "Mantenimiento", label: "Mantenimiento" },
        { value: "Servicios", label: "Servicios" },
        { value: "Impuestos", label: "Impuestos" },
        { value: "Otros", label: "Otros" }
    ]);

    // Cargar inmuebles al iniciar
    useEffect(() => {
        const cargarInmuebles = async () => {
            try {
                const data = await inmuebleService.obtenerInmuebles();
                const opcionesInmuebles = data.map(inmueble => ({
                    value: inmueble.id,
                    label: inmueble.nombre
                }));
                
                // Agregar opción "Todos los inmuebles"
                opcionesInmuebles.unshift({ value: '', label: "Todos los inmuebles" });
                
                setInmuebles(opcionesInmuebles);
            } catch (error) {
                console.error('Error al cargar inmuebles:', error);
            }
        };

        cargarInmuebles();
    }, []);

    // Función para generar el reporte
    const generarReporte = async () => {
        setLoading(true);
        try {
            // Añadir incluir_estadisticas=true para obtener estadísticas
            const filtrosConEstadisticas = { ...filtros, incluir_estadisticas: 'true' };
            const response = await reporteService.generarReporteGastos(filtrosConEstadisticas);
            
            if (response.datos) {
                setGastos(response.datos);
                setEstadisticas(response.estadisticas);
            } else {
                setGastos(response);
                setEstadisticas(null);
            }
        } catch (error) {
            console.error('Error al generar reporte de gastos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generar reporte al cargar el componente
    useEffect(() => {
        generarReporte();
    }, []);

    // Handler para cambios en las fechas
    const handleFechaInicio = (date) => {
        setFiltros({
            ...filtros,
            fecha_inicio: date ? date.format('YYYY-MM-DD') : ''
        });
    };

    const handleFechaFin = (date) => {
        setFiltros({
            ...filtros,
            fecha_fin: date ? date.format('YYYY-MM-DD') : ''
        });
    };

    // Handler para cambios en el inmueble seleccionado
    const handleInmuebleChange = (selectedOption) => {
        setFiltros({
            ...filtros,
            inmueble_id: selectedOption ? selectedOption.value : ''
        });
    };

    // Handler para cambios en el tipo de gasto
    const handleTipoGastoChange = (selectedOption) => {
        setFiltros({
            ...filtros,
            tipo_gasto: selectedOption ? selectedOption.value : ''
        });
    };

    // Handler para el botón de búsqueda
    const handleSearch = () => {
        generarReporte();
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    };

    const columns = [
        {
            title: "Nombre Inmueble",
            dataIndex: "nombre",
            sorter: (a, b) => a.nombre?.localeCompare(b.nombre),
        },
        {
            title: "Monto",
            dataIndex: "monto",
            sorter: (a, b) => (a.monto || 0) - (b.monto || 0),
            render: (monto) => (typeof monto === "number" ? `S/ ${monto.toFixed(2)}` : "N/A")
        },
        {
            title: "Método de Pago",
            dataIndex: "metodo_pago",
            sorter: (a, b) => a.metodo_pago?.localeCompare(b.metodo_pago)
        },
        {
            title: "Tipo de Gasto",
            dataIndex: "tipo_pago",
            sorter: (a, b) => a.tipo_pago?.localeCompare(b.tipo_pago)
        },
        {
            title: "Descripción",
            dataIndex: "descripcion",
            sorter: (a, b) => a.descripcion?.localeCompare(b.descripcion)
        },
        {
            title: "Fecha",
            dataIndex: "creado_en",
            sorter: (a, b) => new Date(a.creado_en) - new Date(b.creado_en),
            render: (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-PE") : "N/A"
        },
        {
            title: "",
            dataIndex: "FIELD8",
            render: (text, record) => (
              <>
                <div className="text-end">
                  <div className="dropdown dropdown-action">
                    <Link
                      to="#"
                      className="action-icon dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fas fa-ellipsis-v" />
                    </Link>
                    <div className="dropdown-menu dropdown-menu-end">
                      <Link className="dropdown-item" to={`/edit-gasto/${record.id}`}>
                        <i className="far fa-edit me-2" />
                        Editar
                      </Link>
                      <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#delete_patient">
                       <i className="fa fa-trash-alt m-r-5"></i> Eliminar</Link>
                    </div>
                  </div>
                </div>
              </>
            ),
          },
    ];

    const customStyles = {
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "#2e37a4" : "rgba(46, 55, 164, 0.1)",
          boxShadow: state.isFocused ? "0 0 0 1px #2e37a4" : "none",
          "&:hover": {
            borderColor: "#2e37a4",
          },
          borderRadius: "10px",
          fontSize: "14px",
          minHeight: "45px",
        }),
        dropdownIndicator: (base, state) => ({
          ...base,
          transform: state.selectProps.menuIsOpen ? "rotate(-180deg)" : "rotate(0)",
          transition: "250ms",
          width: "35px",
          height: "35px",
        }),
      };
      
    return (
        <>
            <Header />
            <Sidebar id='menu-item6' id1='menu-items6' activeClassName='reporte-gastos' />
            <>
                <div>
                    <div className="page-wrapper">
                        <div className="content">
                            {/* Page Header */}
                            <div className="page-header">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <ul className="breadcrumb">
                                            <li className="breadcrumb-item">
                                               <Link to="#">Reporte
                                                </Link>
                                            </li>
                                            <li className="breadcrumb-item">
                                                <i className="feather-chevron-right" >
                                                    <FiChevronRight icon="chevron-right"/>
                                                    </i>

                                                </li>
                                            <li className="breadcrumb-item active">Gastos
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* /Page Header */}
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="card card-table show-entire">
                                        <div className="card-body">
                                            {/* Table Header */}
                                            <div className="page-table-header mb-2">
                                                <div className="row align-items-center">
                                                    <div className="col">
                                                        <div className="doctor-table-blk">
                                                            <h3>Lista de Gastos</h3>
                                                            <div className="doctor-search-blk">
                                                                <div className="top-nav-search table-search-blk">
                                                                    <form>
                                                                        <input type="text" className="form-control" placeholder="Buscar aquí" />
                                                                       <Link className="btn"><img src={searchnormal} alt="#" /></Link>
                                                                    </form>
                                                                </div>
                                                                <div className="add-group">
                                                                    <Link to="/addgasto" className="btn btn-primary add-pluss ms-2"><img src={plusicon} alt="#" /></Link>
                                                                   <Link to="#" className="btn btn-primary doctor-refresh ms-2" onClick={generarReporte}><img src={refreshicon} alt="#" /></Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-auto text-end float-end ms-auto download-grp">
                                                       <Link to="#" className=" me-2"><img src={pdficon} alt="#" /></Link>
                                                       <Link to="#" className=" me-2"><img src={pdficon2} alt="#" /></Link>
                                                       <Link to="#" className=" me-2"><img src={pdficon3} alt="#"  /></Link>
                                                       <Link to="#"><img src={pdficon4} alt="#"  /></Link>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* /Table Header */}
                                            <div className="staff-search-table">
                                                <form>
                                                    <div className="row">
                                                        <div className="col-12 col-md-6 col-xl-3">
                                                            <div className="form-group local-forms">
                                                                <label>Seleccionar Inmueble </label>
                                                                <Select
                                                                    options={inmuebles}
                                                                    onChange={handleInmuebleChange}
                                                                    menuPortalTarget={document.body}
                                                                    styles={customStyles}
                                                                    placeholder="Seleccionar inmueble"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-6 col-xl-3">
                                                            <div className="form-group local-forms cal-icon">
                                                                <label>Desde</label>
                                                                <DatePicker 
                                                                    className="form-control datetimepicker" 
                                                                    onChange={handleFechaInicio}
                                                                    suffixIcon={null}
                                                                    format="DD/MM/YYYY"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-6 col-xl-3">
                                                            <div className="form-group local-forms cal-icon">
                                                                <label>Hasta</label>
                                                                <DatePicker 
                                                                    className="form-control datetimepicker" 
                                                                    onChange={handleFechaFin}
                                                                    suffixIcon={null}
                                                                    format="DD/MM/YYYY"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-6 col-xl-3">
                                                            <div className="form-group local-forms">
                                                                <label>Tipo de Gasto</label>
                                                                <Select
                                                                    options={tipoGastos}
                                                                    onChange={handleTipoGastoChange}
                                                                    menuPortalTarget={document.body}
                                                                    styles={customStyles}
                                                                    placeholder="Seleccionar tipo"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-6 col-xl-3 ms-auto">
                                                            <div className="doctor-submit">
                                                                <button type="button" className="btn btn-primary submit-form me-2" onClick={handleSearch}>
                                                                    Buscar
                                                                </button>
                                                                <button type="button" className="btn btn-primary filter-form" onClick={() => {
                                                                    setFiltros({
                                                                        fecha_inicio: '',
                                                                        fecha_fin: '',
                                                                        inmueble_id: '',
                                                                        tipo_gasto: ''
                                                                    });
                                                                    generarReporte();
                                                                }}>
                                                                    Limpiar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            
                                            {/* Estadísticas */}
                                            {estadisticas && (
                                                <div className="row mb-4">
                                                    <div className="col-md-4">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Total Registros</h5>
                                                                <p className="card-text h4">{estadisticas.total_registros}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Monto Total</h5>
                                                                <p className="card-text h4">S/ {estadisticas.total_monto.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="col-md-4">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Distribución por Tipo</h5>
                                                                <div style={{maxHeight: '100px', overflowY: 'auto'}}>
                                                                    {Object.entries(estadisticas.gastos_por_tipo).map(([tipo, data]) => (
                                                                        <div key={tipo} className="d-flex justify-content-between">
                                                                            <span>{tipo}:</span>
                                                                            <span>S/ {data.monto_total.toFixed(2)} ({data.cantidad})</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="table-responsive">
                                                <Table
                                                    pagination={{
                                                        total: gastos.length,
                                                        showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} entradas`,
                                                        showSizeChanger: true, onShowSizeChange: onShowSizeChange, itemRender: itemRender
                                                    }}
                                                    style={{ overflowX: 'auto' }}
                                                    columns={columns}
                                                    dataSource={gastos}
                                                    rowKey={record => record.id}
                                                    rowSelection={rowSelection}
                                                    loading={loading}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </>
    )
}

export default ReporteGastos;
