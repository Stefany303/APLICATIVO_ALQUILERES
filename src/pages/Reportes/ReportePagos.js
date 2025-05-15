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
import {onShowSizeChange,itemRender}from '../../components/Pagination'
import Select from "react-select";
import reporteService from '../../services/reporteService';
import inmuebleService from '../../services/inmuebleService';
import moment from 'moment';

const ReportePagos = () => {
    const [inmuebles, setInmuebles] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [filtros, setFiltros] = useState({
        fecha_inicio: '',
        fecha_fin: '',
        inmueble_id: '',
        estado: ''
    });

    // Estados de pago
    const [payment, setPayment] = useState([
        { value: '', label: "Todos los estados" },
        { value: "pagado", label: "Pagado" },
        { value: "pendiente", label: "Pendiente" }
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
            const response = await reporteService.generarReportePagos(filtrosConEstadisticas);
            
            if (response.datos) {
                setPagos(response.datos);
                setEstadisticas(response.estadisticas);
            } else {
                setPagos(response);
                setEstadisticas(null);
            }
        } catch (error) {
            console.error('Error al generar reporte de pagos:', error);
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

    // Handler para cambios en el estado de pago
    const handleEstadoChange = (selectedOption) => {
        setFiltros({
            ...filtros,
            estado: selectedOption ? selectedOption.value : ''
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
            dataIndex: "nombre_inmueble",
            sorter: (a, b) => a.nombre_inmueble?.localeCompare(b.nombre_inmueble),
        },
        {
            title: "Espacio",
            dataIndex: "nombre_espacio",
            sorter: (a, b) => a.nombre_espacio?.localeCompare(b.nombre_espacio),
        },
        {
            title: "Inquilino",
            render: (_, record) => `${record.Nombres} ${record.Apellidos}`,
            sorter: (a, b) => `${a.Nombres} ${a.Apellidos}`.localeCompare(`${b.Nombres} ${b.Apellidos}`),
        },
        {
            title: "DNI",
            dataIndex: "DNI",
            sorter: (a, b) => a.DNI?.localeCompare(b.DNI),
        },
        {
            title: "Monto",
            dataIndex: "monto",
            sorter: (a, b) => parseFloat(a.monto || 0) - parseFloat(b.monto || 0),
            render: (monto) => `S/ ${parseFloat(monto).toFixed(2)}`
        },
        {
            title: "Método de Pago",
            dataIndex: "metodo_pago",
            sorter: (a, b) => a.metodo_pago?.localeCompare(b.metodo_pago),
            render: (text) => text?.charAt(0).toUpperCase() + text?.slice(1)
        },
        {
            title: "Tipo de Pago",
            dataIndex: "tipo_pago",
            sorter: (a, b) => a.tipo_pago?.localeCompare(b.tipo_pago),
            render: (text) => text?.charAt(0).toUpperCase() + text?.slice(1)
        },
        {
            title: "Fecha de Pago",
            dataIndex: "fecha_pago",
            sorter: (a, b) => new Date(a.fecha_pago) - new Date(b.fecha_pago),
            render: (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-PE") : "N/A"
        },
        {
            title: "Estado",
            dataIndex: "estado",
            sorter: (a, b) => a.estado?.localeCompare(b.estado),
            render: (text) => (
                <div>
                    {text === "pagado" && (
                        <span className="custom-badge status-green">
                            Pagado
                        </span>
                    )}
                    {text === "pendiente" && (
                        <span className="custom-badge status-pink">
                            Pendiente
                        </span>
                    )}
                </div>
            )
        },
        {
            title: "",
            dataIndex: "acciones",
            render: (_, record) => (
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
                            <Link className="dropdown-item" to={`/edit-payment/${record.id}`}>
                                <i className="far fa-edit me-2" />
                                Editar
                            </Link>
                            <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#delete_patient">
                                <i className="fa fa-trash-alt m-r-5"></i> Eliminar
                            </Link>
                        </div>
                    </div>
                </div>
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
            <Sidebar id='menu-item6' id1='menu-items6' activeClassName='reporte-pagos' />
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
                                            <li className="breadcrumb-item active">Pagos
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
                                                            <h3>Lista de Pagos</h3>
                                                            <div className="doctor-search-blk">
                                                                <div className="top-nav-search table-search-blk">
                                                                    <form>
                                                                        <input type="text" className="form-control" placeholder="Buscar aquí" />
                                                                       <Link className="btn"><img src={searchnormal} alt="#" /></Link>
                                                                    </form>
                                                                </div>
                                                                <div className="add-group">
                                                                    <Link to="/addpayment" className="btn btn-primary add-pluss ms-2"><img src={plusicon} alt="#" /></Link>
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
                                                            <div className="form-group local-forms">
                                                                <label>Estado de Pago </label>
                                                                <Select
                                                                    options={payment}
                                                                    onChange={handleEstadoChange}
                                                                    menuPortalTarget={document.body}
                                                                    styles={customStyles}
                                                                    placeholder="Seleccionar estado"
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
                                                                        estado: ''
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
                                                    <div className="col-md-3">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Total Registros</h5>
                                                                <p className="card-text h4">{estadisticas.total_registros}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Monto Total</h5>
                                                                <p className="card-text h4">S/ {estadisticas.total_monto.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Pagos Cancelados</h5>
                                                                <p className="card-text h4">{estadisticas.pagos_completados}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Pagos Pendientes</h5>
                                                                <p className="card-text h4">{estadisticas.pagos_pendientes}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="table-responsive">
                                                <Table
                                                    pagination={{
                                                        total: pagos.length,
                                                        showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} entradas`,
                                                        showSizeChanger: true, onShowSizeChange: onShowSizeChange, itemRender: itemRender
                                                    }}
                                                    style={{ overflowX: 'auto' }}
                                                    columns={columns}
                                                    dataSource={pagos}
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
                        <div className="notification-box">
                            <div className="msg-sidebar notifications msg-noti">
                                <div className="topnav-dropdown-header">
                                    <span>Messages</span>
                                </div>
                                <div className="drop-scroll msg-list-scroll" id="msg_list">
                                    <ul className="list-box">
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">R</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">Richard Miles
                                                        </span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item new-message">
                                                    <div className="list-left">
                                                        <span className="avatar">J</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">John Doe</span>
                                                        <span className="message-time">1 Aug</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">T</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">
                                                            Tarah Shropshire
                                                        </span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">M</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">Mike Litorus</span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">C</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">
                                                            Catherine Manseau
                                                        </span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">D</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">
                                                            Domenic Houston
                                                        </span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">B</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">
                                                            Buster Wigton
                                                        </span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">R</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">
                                                            Rolland Webber
                                                        </span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">C</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">
                                                            Claire Mapes
                                                        </span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">M</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">Melita Faucher</span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">J</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">Jeffery Lalor</span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">L</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">Loren Gatlin</span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="#">
                                                <div className="list-item">
                                                    <div className="list-left">
                                                        <span className="avatar">T</span>
                                                    </div>
                                                    <div className="list-body">
                                                        <span className="message-author">Tarah Shropshire</span>
                                                        <span className="message-time">12:28 AM</span>
                                                        <div className="clearfix" />
                                                        <span className="message-content">Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <div className="topnav-dropdown-footer">
                                   <Link to="#">See all messages</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="delete_patient" className="modal fade delete-modal" role="dialog">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-body text-center">
                                    <img src={imagesend} alt="#"
                                        width={50}
                                        height={46} />
                                    <h3>Are you sure want to delete this ?</h3>
                                    <div className="m-t-20">
                                       <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">Close</Link>
                                        <button type="submit" className="btn btn-danger">Delete</button>
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

export default ReportePagos;
